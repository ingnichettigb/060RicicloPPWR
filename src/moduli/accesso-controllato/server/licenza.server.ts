// ======================================================================
// Nome File: licenza.server.ts
// Percorso: src/moduli/accesso-controllato/server/licenza.server.ts
// Revisione: Rev. 2 (Consenso vincolato a PUK_CODE ed email utente)
// Data/Ora: 2026-10-03 21:05
// ======================================================================

// SOLO SERVER. Licenze, PUK, quota export PDF e consenso, sul database esterno condiviso del portfolio.
import { APP_CODE, TERMS_VERSION } from "../config";
import { FN004_FormattaErrore } from "../errori";
import type { EsitoAttivazione, EsitoConsenso, EsitoDecremento, LinguaAccesso, StatoLicenza } from "../tipi";
import { FN019_ClienteEsterno, FN020_ClienteLocale } from "./esterno.server";

type RigaLicenza = {
  id: string;
  expires_at: string | null;
  activated_at: string | null;
  subscription_type: string | null;
};

// ======================================================================
// FN028[EscapeLike]: protegge i caratteri speciali (% _ \) per i confronti ilike sull'email.
// ======================================================================
function FN028_EscapeLike(testo: string): string {
  return testo.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// ======================================================================
// FN029[StatoLicenza]: legge la licenza e dice se è valida, scaduta, disattivata o non trovata.
// ======================================================================
export async function FN029_StatoLicenza(licenseId: string): Promise<StatoLicenza> {
  const ext = FN019_ClienteEsterno();
  const { data, error } = await ext
    .from("licenses")
    .select("id, app_code, is_active, expires_at")
    .eq("id", licenseId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.app_code !== APP_CODE) return { valida: false, motivo: "not_found" };
  if (!data.is_active) return { valida: false, motivo: "deactivated" };
  if (data.expires_at && new Date(String(data.expires_at)).getTime() <= Date.now()) {
    return { valida: false, motivo: "expired" };
  }
  return { valida: true };
}

// ======================================================================
// FN030[EmailVerificata]: controlla su lead_emails che l'email abbia superato la verifica OTP.
// ======================================================================
async function FN030_EmailVerificata(email: string): Promise<boolean> {
  const { data, error } = await FN020_ClienteLocale()
    .from("lead_emails")
    .select("is_verified")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.is_verified === true;
}

// ======================================================================
// FN031[RisolviUtente]: trova (o crea se richiesto) l'utente nella tabella condivisa users a partire dall'email.
// ======================================================================
async function FN031_RisolviUtente(email: string, crea: boolean): Promise<string | null> {
  const ext = FN019_ClienteEsterno();
  const cerca = async (): Promise<string | null> => {
    const { data, error } = await ext.from("users").select("id").ilike("email", FN028_EscapeLike(email)).limit(1);
    if (error) throw new Error(error.message);
    const riga = (data ?? [])[0] as { id: string } | undefined;
    return riga?.id ?? null;
  };
  const trovato = await cerca();
  if (trovato || !crea) return trovato;
  const { data, error } = await ext.from("users").insert({ email }).select("id").limit(1);
  if (!error) {
    const riga = (data ?? [])[0] as { id: string } | undefined;
    if (riga?.id) return riga.id;
  }
  // Possibile inserimento concorrente: si rilegge.
  return cerca();
}

// ======================================================================
// FN032[AttivaLicenza]: esegue i controlli ERR001-ERR204 e assegna in modo atomico il PUK all'utente (claim).
// ======================================================================
export async function FN032_AttivaLicenza(
  email: string,
  chiaveLicenza: string,
  codicePuk: string,
): Promise<EsitoAttivazione> {
  if (!(await FN030_EmailVerificata(email))) return { ok: false, codice: "ERR001" };
  const chiave = chiaveLicenza.trim();
  const puk = codicePuk.trim();
  if (!chiave || !puk) return { ok: false, codice: "ERR016" };

  const ext = FN019_ClienteEsterno();
  const ora = new Date();

  const { data: licenze, error: errLicenze } = await ext
    .from("licenses")
    .select("id, expires_at, activated_at, subscription_type")
    .eq("license_key", chiave)
    .eq("app_code", APP_CODE)
    .eq("is_active", true);
  if (errLicenze) throw new Error(errLicenze.message);
  const elenco = (licenze ?? []) as RigaLicenza[];
  if (elenco.length === 0) return { ok: false, codice: "ERR101" };
  const valide = elenco.filter((l) => !l.expires_at || new Date(l.expires_at).getTime() > ora.getTime());
  if (valide.length === 0) return { ok: false, codice: "ERR103" };

  const { data: rigaPuk, error: errPuk } = await ext
    .from("puk_codes")
    .select("id, user_id, type_product_code, license_id")
    .eq("code", puk)
    .maybeSingle();
  if (errPuk) throw new Error(errPuk.message);
  if (!rigaPuk) return { ok: false, codice: "ERR201" };
  if (rigaPuk.type_product_code !== APP_CODE) return { ok: false, codice: "ERR203" };

  let licenza = valide.find((l) => l.id === rigaPuk.license_id);
  if (!licenza) {
    const { data: mappe, error: errMappa } = await ext
      .from("license_puk_map")
      .select("license_id")
      .eq("puk_id", rigaPuk.id)
      .in(
        "license_id",
        valide.map((l) => l.id),
      );
    if (errMappa) throw new Error(errMappa.message);
    const idMappato = ((mappe ?? [])[0] as { license_id: string } | undefined)?.license_id;
    licenza = valide.find((l) => l.id === idMappato);
  }
  if (!licenza) return { ok: false, codice: "ERR204" };

  const utenteId = await FN031_RisolviUtente(email, true);
  if (!utenteId) return { ok: false, codice: "ERR500" };

  let riattivata = false;
  if (rigaPuk.user_id) {
    if (rigaPuk.user_id !== utenteId) return { ok: false, codice: "ERR202" };
    riattivata = true;
  } else {
    const { data: aggiornati, error: errClaim } = await ext
      .from("puk_codes")
      .update({ user_id: utenteId, used: true, used_at: ora.toISOString() })
      .eq("id", rigaPuk.id)
      .is("user_id", null)
      .select("id");
    if (errClaim) throw new Error(errClaim.message);
    if (!aggiornati || aggiornati.length === 0) {
      const { data: rilettura } = await ext.from("puk_codes").select("user_id").eq("id", rigaPuk.id).maybeSingle();
      if (rilettura?.user_id !== utenteId) return { ok: false, codice: "ERR202" };
      riattivata = true;
    }
  }

  if (!licenza.activated_at) {
    const modifica: Record<string, string> = { activated_at: ora.toISOString() };
    if (licenza.subscription_type === "single_use") {
      modifica["expires_at"] = new Date(ora.getTime() + 48 * 3_600_000).toISOString();
    }
    await ext.from("licenses").update(modifica).eq("id", licenza.id).is("activated_at", null);
  }

  return { ok: true, licenseId: licenza.id, pukId: String(rigaPuk.id), riattivata };
}

// ======================================================================
// FN033[ProprietaPuk]: verifica che il PUK indicato appartenga all'utente della sessione (impedisce di toccare PUK altrui).
// ======================================================================
async function FN033_ProprietaPuk(email: string, pukId: string): Promise<boolean> {
  const utenteId = await FN031_RisolviUtente(email, false);
  if (!utenteId) return false;
  const { data, error } = await FN019_ClienteEsterno()
    .from("puk_codes")
    .select("user_id")
    .eq("id", pukId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.user_id === utenteId;
}

// ======================================================================
// FN034[LeggiQuotaPdf]: restituisce gli export PDF residui del PUK (null = illimitati).
// ======================================================================
export async function FN034_LeggiQuotaPdf(email: string, pukId: string): Promise<number | null> {
  if (!(await FN033_ProprietaPuk(email, pukId))) return null;
  const { data, error } = await FN019_ClienteEsterno()
    .from("puk_codes")
    .select("pdf_exports_remaining")
    .eq("id", pukId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const valore = data?.pdf_exports_remaining;
  return typeof valore === "number" ? valore : null;
}

// ======================================================================
// FN035[DecrementaQuotaPdf]: scala di 1 gli export PDF del PUK con guardia anti-concorrenza; non tocca mai la licenza.
// ======================================================================
export async function FN035_DecrementaQuotaPdf(email: string, pukId: string): Promise<EsitoDecremento> {
  if (!(await FN033_ProprietaPuk(email, pukId))) return { ok: false, codice: "ERR204" };
  const ext = FN019_ClienteEsterno();
  for (let tentativo = 0; tentativo < 3; tentativo++) {
    const { data, error } = await ext.from("puk_codes").select("pdf_exports_remaining").eq("id", pukId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return { ok: false, codice: "ERR204" };
    const attuale = data.pdf_exports_remaining;
    if (typeof attuale !== "number") return { ok: true, consentito: true, remaining: null, esaurito: false };
    if (attuale <= 0) return { ok: true, consentito: false, remaining: 0, esaurito: true };
    const nuovo = attuale - 1;
    const { data: aggiornati, error: errAgg } = await ext
      .from("puk_codes")
      .update({ pdf_exports_remaining: nuovo })
      .eq("id", pukId)
      .eq("pdf_exports_remaining", attuale)
      .select("id");
    if (errAgg) throw new Error(errAgg.message);
    if (aggiornati && aggiornati.length > 0) {
      return { ok: true, consentito: true, remaining: nuovo, esaurito: nuovo <= 0 };
    }
  }
  console.error(FN004_FormattaErrore("ERR500"), "conflitto ripetuto nel decremento export PDF");
  return { ok: false, codice: "ERR500" };
}

// ======================================================================
// FN036[ConsensoAccettato]: controlla se per il PUK e l'utente esiste già
// il consenso alla versione corrente delle condizioni sul database centrale.
// ======================================================================
export async function FN036_ConsensoAccettato(email: string, licenseId: string, pukId: string): Promise<boolean> {
  const ext = FN019_ClienteEsterno();
  const utenteId = await FN031_RisolviUtente(email, false);
  if (!utenteId) return false;

  const { data: rigaPuk, error: errPuk } = await ext
    .from("puk_codes")
    .select("code, user_id")
    .eq("id", pukId)
    .maybeSingle();
  if (errPuk) throw new Error(errPuk.message);
  if (!rigaPuk || rigaPuk.user_id !== utenteId) return false;

  const { data, error } = await ext
    .from("license_consents")
    .select("id")
    .eq("license_id", licenseId)
    .eq("puk_code", rigaPuk.code)
    .eq("app_code", APP_CODE)
    .eq("terms_version", TERMS_VERSION)
    .limit(1);
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

// ======================================================================
// FN037[RegistraConsenso]: registra il consenso vincolato al PUK e all'utente
// (lingua, versione, user agent, IP) se la licenza e il PUK sono validi.
// ======================================================================
export async function FN037_RegistraConsenso(
  email: string,
  licenseId: string,
  pukId: string,
  lingua: LinguaAccesso,
  userAgent: string | null,
  ip: string | null,
): Promise<EsitoConsenso> {
  const stato = await FN029_StatoLicenza(licenseId);
  if (!stato.valida) return { ok: false, codice: "ERR302" };

  const ext = FN019_ClienteEsterno();
  const utenteId = await FN031_RisolviUtente(email, false);
  if (!utenteId) return { ok: false, codice: "ERR015" };

  const { data: rigaPuk, error: errPuk } = await ext
    .from("puk_codes")
    .select("code, user_id")
    .eq("id", pukId)
    .maybeSingle();
  if (errPuk) throw new Error(errPuk.message);
  if (!rigaPuk || rigaPuk.user_id !== utenteId) return { ok: false, codice: "ERR204" };

  if (await FN036_ConsensoAccettato(email, licenseId, pukId)) return { ok: true };

  const { error } = await ext.from("license_consents").insert({
    license_id: licenseId,
    puk_code: rigaPuk.code,
    app_code: APP_CODE,
    language: lingua,
    terms_version: TERMS_VERSION,
    accepted_at: new Date().toISOString(),
    user_agent: userAgent,
    ip_address: ip,
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}
