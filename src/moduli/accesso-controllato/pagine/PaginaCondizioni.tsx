// ======================================================================
// Nome File: PaginaCondizioni.tsx
// Percorso: src/moduli/accesso-controllato/pagine/PaginaCondizioni.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Schermata 0003 - Accettazione delle condizioni d'uso (saltata se già accettate per questa licenza).
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LICENSE_ID_KEY, ROTTA_HOME } from "../config";
import { FN004_FormattaErrore } from "../errori";
import { FN043_ControllaConsensoFn, FN044_RegistraConsensoFn } from "../accesso.functions";
import { useRichiediLivello } from "../hookAccesso";
import { FN008_LeggiChiave, FN013_SalvaConsenso } from "../stato";
import { CLASSE_ERRORE, CLASSE_PULSANTE } from "../stili";
import { useTestiAccesso } from "../testi";
import { FN065_CorniceAccesso } from "./CorniceAccesso";

// ======================================================================
// FN054[PaginaCondizioni]: schermata 0003: mostra le condizioni nelle 4 lingue e registra l'accettazione.
// ======================================================================
export function FN054_PaginaCondizioni() {
  const { t, te, lingua } = useTestiAccesso();
  const navigate = useNavigate();
  const pronto = useRichiediLivello("licenza");
  const [verificato, setVerificato] = useState(false);
  const [accetto, setAccetto] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pronto) return;
    const licenseId = FN008_LeggiChiave(LICENSE_ID_KEY);
    if (!licenseId) return;
    let annullato = false;
    FN043_ControllaConsensoFn({ data: { licenseId } })
      .then((r) => {
        if (annullato) return;
        if (r.accettato) {
          FN013_SalvaConsenso();
          navigate({ to: ROTTA_HOME, replace: true });
        } else {
          setVerificato(true);
        }
      })
      .catch(() => {
        if (!annullato) setVerificato(true);
      });
    return () => {
      annullato = true;
    };
  }, [pronto, navigate]);

  // ======================================================================
  // FN055[AccettaCondizioni]: registra il consenso sul server e apre l'applicazione.
  // ======================================================================
  async function FN055_AccettaCondizioni() {
    const licenseId = FN008_LeggiChiave(LICENSE_ID_KEY);
    if (!licenseId) return;
    setMsg(null);
    setBusy(true);
    try {
      const esito = await FN044_RegistraConsensoFn({ data: { licenseId, lingua } });
      if (!esito.ok) {
        setMsg(te(esito.codice));
        return;
      }
      FN013_SalvaConsenso();
      navigate({ to: ROTTA_HOME, replace: true });
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      setMsg(te("ERR500"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <FN065_CorniceAccesso schermata="0003" titolo={t("con.titolo")}>
      {!pronto || !verificato ? (
        <p className="mt-4 text-[13px] text-muted-foreground">{t("con.verifica")}</p>
      ) : (
        <div className="mt-4 space-y-3 text-[13px]">
          <p>{t("con.p1")}</p>
          <p>{t("con.p2")}</p>
          <p>{t("con.p3")}</p>
          <p>{t("con.p4")}</p>
          <label className="flex items-start gap-2">
            <input
              id="0005_CheckAccettoCondizioni"
              name="0005_CheckAccettoCondizioni"
              type="checkbox"
              checked={accetto}
              onChange={(ev) => setAccetto(ev.target.checked)}
              className="mt-0.5"
            />
            <span>{t("con.accetto")}</span>
          </label>
          {/* BT08_AccettaCondizioni */}
          <button
            type="button"
            disabled={!accetto || busy}
            onClick={FN055_AccettaCondizioni}
            className={CLASSE_PULSANTE}
          >
            {busy ? t("con.salvataggio") : t("con.continua")}
          </button>
        </div>
      )}
      {msg && (
        <p role="alert" className={CLASSE_ERRORE}>
          {msg}
        </p>
      )}
    </FN065_CorniceAccesso>
  );
}
