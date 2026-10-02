// ======================================================================
// Nome File: PaginaAttivazione.tsx
// Percorso: src/moduli/accesso-controllato/pagine/PaginaAttivazione.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Schermata 0002 - Attivazione della licenza con chiave e codice PUK.
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { VERIFIED_EMAIL_KEY } from "../config";
import { FN004_FormattaErrore } from "../errori";
import { FN041_AttivaLicenzaFn } from "../accesso.functions";
import { useRichiediLivello } from "../hookAccesso";
import { FN008_LeggiChiave, FN012_SalvaAttivazione } from "../stato";
import { CLASSE_CAMPO, CLASSE_ERRORE, CLASSE_ETICHETTA, CLASSE_PULSANTE } from "../stili";
import { useTestiAccesso } from "../testi";
import { FN065_CorniceAccesso } from "./CorniceAccesso";

// ======================================================================
// FN052[PaginaAttivazione]: schermata 0002: chiede chiave di licenza e PUK e li invia al server per l'attivazione.
// ======================================================================
export function FN052_PaginaAttivazione() {
  const { t, te } = useTestiAccesso();
  const navigate = useNavigate();
  const pronto = useRichiediLivello("email");
  const [email, setEmail] = useState("");
  const [chiave, setChiave] = useState("");
  const [puk, setPuk] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEmail(FN008_LeggiChiave(VERIFIED_EMAIL_KEY) ?? "");
  }, []);

  // ======================================================================
  // FN053[AttivaLicenzaUi]: invia chiave e PUK al server; se l'attivazione riesce salva i dati e passa alle condizioni d'uso.
  // ======================================================================
  async function FN053_AttivaLicenzaUi(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!chiave.trim() || !puk.trim()) {
      setMsg(te("ERR016"));
      return;
    }
    setBusy(true);
    try {
      const esito = await FN041_AttivaLicenzaFn({
        data: { licenseKey: chiave.trim(), puk: puk.trim() },
      });
      if (!esito.ok) {
        setMsg(te(esito.codice));
        return;
      }
      FN012_SalvaAttivazione(esito.licenseId, esito.pukId);
      navigate({ to: "/condizioni", replace: true });
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      setMsg(te("ERR500"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <FN065_CorniceAccesso schermata="0002" titolo={t("att.titolo")}>
      {pronto && (
        <form onSubmit={FN053_AttivaLicenzaUi} className="mt-4 space-y-3">
          <p className="text-[13px] text-muted-foreground">{t("att.intro")}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{t("att.email", { email })}</p>
          <label className="block">
            <span className={CLASSE_ETICHETTA}>{t("att.chiave")}</span>
            <input
              id="0003_InputChiaveLicenza"
              name="0003_InputChiaveLicenza"
              type="text"
              autoComplete="off"
              value={chiave}
              maxLength={200}
              onChange={(ev) => setChiave(ev.target.value)}
              className={CLASSE_CAMPO}
            />
          </label>
          <label className="block">
            <span className={CLASSE_ETICHETTA}>{t("att.puk")}</span>
            <input
              id="0004_InputCodicePuk"
              name="0004_InputCodicePuk"
              type="text"
              autoComplete="off"
              value={puk}
              maxLength={200}
              onChange={(ev) => setPuk(ev.target.value)}
              className={CLASSE_CAMPO}
            />
          </label>
          {/* BT07_AttivaLicenza */}
          <button type="submit" disabled={busy} className={CLASSE_PULSANTE}>
            {busy ? t("att.attivando") : t("att.attiva")}
          </button>
        </form>
      )}
      {msg && (
        <p role="alert" className={CLASSE_ERRORE}>
          {msg}
        </p>
      )}
    </FN065_CorniceAccesso>
  );
}
