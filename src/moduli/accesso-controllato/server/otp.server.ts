// ======================================================================
// Nome File: otp.server.ts
// Percorso: src/moduli/accesso-controllato/server/otp.server.ts
// Revisione: Rev. 2 (chiamata diretta API Resend)
// Data/Ora: 2026-10-03 10:58
// ======================================================================

// SOLO SERVER. Richiesta e verifica del codice OTP via email, e creazione del token per la sessione Supabase.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  APP_CODE,
  APP_NAME,
  EMAIL_MITTENTE,
  OTP_FINESTRA_ORE,
  OTP_MAX_ERRORI,
  OTP_MAX_RICHIESTE,
  OTP_SCADENZA_MINUTI,
} from "../config";
import { FN004_FormattaErrore } from "../errori";
import type { EsitoRichiestaOtp, EsitoVerificaOtp, LinguaAccesso } from "../tipi";
import { FN020_ClienteLocale } from "./esterno.server";

const TESTI_EMAIL: Record<LinguaAccesso, { oggetto: string; corpo: string }> = {
  it: { oggetto: "il tuo codice di verifica", corpo: "Il tuo codice di verifica è" },
  en: { oggetto: "your verification code", corpo: "Your verification code is" },
  de: { oggetto: "dein Bestätigungscode", corpo: "Dein Bestätigungscode lautet" },
  es: { oggetto: "tu código de verificación", corpo: "Tu código de verificación es" },
};

// ======================================================================
// FN021[NormalizzaEmail]: porta l'email in minuscolo e restituisce null se il formato non è valido.
// ======================================================================
export function FN021_NormalizzaEmail(grezza: string): string | null {
  const email = grezza.trim().toLowerCase();
  if (email.length > 255 || !/^\S+@\S+\.\S+$/.test(email)) return null;
  return email;
}

// ======================================================================
// FN022[GeneraCodiceOtp]: genera un codice numerico a 6 cifre con generatore casuale sicuro.
// ======================================================================
function FN022_GeneraCodiceOtp(): string {
  const valori = new Uint32Array(1);
  crypto.getRandomValues(valori);
  const numero = (valori[0] ?? 0) % 1_000_000;
  return String(numero).padStart(6, "0");
}

// ======================================================================
// FN023[ConfrontaCostante]: confronta due stringhe in tempo costante per evitare attacchi a tempo.
// ======================================================================
function FN023_ConfrontaCostante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let differenza = 0;
  for (let i = 0; i < a.length; i++) differenza |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return differenza === 0;
}

// ======================================================================
// FN024[InviaEmailOtp]: invia il codice OTP tramite API ufficiale di Resend.
// ======================================================================
async function FN024_InviaEmailOtp(email: string, codice: string, lingua: LinguaAccesso): Promise<boolean> {
  const chiaveResend = process.env["RESEND_API_KEY"];
  if (!chiaveResend) {
    console.error(FN004_FormattaErrore("ERR013"), "RESEND_API_KEY mancante");
    return false;
  }
  const testi = TESTI_EMAIL[lingua];
  const mittente = process.env["RESEND_FROM_EMAIL"] || EMAIL_MITTENTE;
  const html =
    `<p>${testi.corpo}:</p>` +
    `<p style="font-size:28px;font-weight:700;letter-spacing:6px">${codice}</p>` +
    `<p style="color:#666">${APP_NAME} — ${OTP_SCADENZA_MINUTI} min</p>`;
  try {
    const risposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chiaveResend}`,
      },
      body: JSON.stringify({
        from: mittente,
        to: [email],
        subject: `${APP_NAME} — ${testi.oggetto}`,
        html,
      }),
    });
    if (!risposta.ok) {
      console.error(FN004_FormattaErrore("ERR013"), risposta.status, await risposta.text());
      return false;
    }
    return true;
  } catch (errore) {
    console.error(FN004_FormattaErrore("ERR013"), errore);
    return false;
  }
}

// ======================================================================
// FN025[RichiediOtp]: genera e salva un OTP (max 3 richieste ogni 24 ore per email) e lo invia per email.
// ======================================================================
export async function FN025_RichiediOtp(emailGrezza: string, lingua: LinguaAccesso): Promise<EsitoRichiestaOtp> {
  const email = FN021_NormalizzaEmail(emailGrezza);
  if (!email) return { ok: false, codice: "ERR010" };

  const db = FN020_ClienteLocale();
  const ora = new Date();
  const { data: riga, error: errLettura } = await db
    .from("lead_emails")
    .select("otp_attempts, otp_window_start")
    .eq("email", email)
    .maybeSingle();
  if (errLettura) {
    console.error(FN004_FormattaErrore("ERR500"), errLettura.message);
    return { ok: false, codice: "ERR500" };
  }

  let tentativi = 0;
  let inizioFinestra = ora;
  if (riga?.otp_window_start) {
    const inizio = new Date(String(riga.otp_window_start));
    if (ora.getTime() - inizio.getTime() < OTP_FINESTRA_ORE * 3_600_000) {
      tentativi = Number(riga.otp_attempts ?? 0);
      inizioFinestra = inizio;
    }
  }
  if (tentativi >= OTP_MAX_RICHIESTE) return { ok: false, codice: "ERR011" };

  const codice = FN022_GeneraCodiceOtp();
  const { error: errScrittura } = await db.from("lead_emails").upsert(
    {
      email,
      verification_code: codice,
      otp_sent_at: ora.toISOString(),
      otp_failures: 0,
      otp_attempts: tentativi + 1,
      otp_window_start: inizioFinestra.toISOString(),
      source: APP_CODE,
    },
    { onConflict: "email" },
  );
  if (errScrittura) {
    console.error(FN004_FormattaErrore("ERR500"), errScrittura.message);
    return { ok: false, codice: "ERR500" };
  }

  const inviata = await FN024_InviaEmailOtp(email, codice, lingua);
  if (!inviata) return { ok: false, codice: "ERR013" };
  return { ok: true, scadenzaMinuti: OTP_SCADENZA_MINUTI };
}

// ======================================================================
// FN026[CreaTokenSessione]: crea (se manca) l'utente Supabase e genera il token monouso per aprire la sessione nel browser.
// ======================================================================
async function FN026_CreaTokenSessione(email: string): Promise<string | null> {
  // L'utente può già esistere: l'eventuale errore di creazione viene ignorato di proposito.
  await supabaseAdmin.auth.admin.createUser({ email, email_confirm: true });
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    console.error(FN004_FormattaErrore("ERR014"), error?.message ?? "token assente");
    return null;
  }
  return tokenHash;
}

// ======================================================================
// FN027[VerificaOtp]: controlla il codice (scadenza 10 minuti, max 5 errori), segna l'email verificata e restituisce il token di sessione.
// ======================================================================
export async function FN027_VerificaOtp(emailGrezza: string, codice: string): Promise<EsitoVerificaOtp> {
  const email = FN021_NormalizzaEmail(emailGrezza);
  if (!email) return { ok: false, codice: "ERR010" };
  if (!/^\d{6}$/.test(codice)) return { ok: false, codice: "ERR012" };

  const db = FN020_ClienteLocale();
  const { data: riga, error } = await db
    .from("lead_emails")
    .select("verification_code, otp_sent_at, otp_failures")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    console.error(FN004_FormattaErrore("ERR500"), error.message);
    return { ok: false, codice: "ERR500" };
  }
  if (!riga || !riga.verification_code || !riga.otp_sent_at) return { ok: false, codice: "ERR012" };

  const errori = Number(riga.otp_failures ?? 0);
  const scaduto = Date.now() - new Date(String(riga.otp_sent_at)).getTime() > OTP_SCADENZA_MINUTI * 60_000;
  if (scaduto || errori >= OTP_MAX_ERRORI) return { ok: false, codice: "ERR012" };

  if (!FN023_ConfrontaCostante(String(riga.verification_code), codice)) {
    await db
      .from("lead_emails")
      .update({ otp_failures: errori + 1 })
      .eq("email", email);
    return { ok: false, codice: "ERR012" };
  }

  const { error: errAggiorna } = await db
    .from("lead_emails")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_code: null,
      otp_failures: 0,
    })
    .eq("email", email);
  if (errAggiorna) {
    console.error(FN004_FormattaErrore("ERR500"), errAggiorna.message);
    return { ok: false, codice: "ERR500" };
  }

  const tokenHash = await FN026_CreaTokenSessione(email);
  if (!tokenHash) return { ok: false, codice: "ERR014" };
  return { ok: true, tokenHash, email };
}
