// ======================================================================
// Nome File: PortaAccesso.tsx
// Percorso: src/moduli/accesso-controllato/PortaAccesso.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Protezione globale delle rotte private: sessione, email verificata, licenza, consenso e rivalidazione a ogni cambio pagina.
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "./adattatore";
import {
  ACTIVATED_KEY,
  CONSENT_KEY,
  FN003_PulisciChiaviLicenza,
  LAST_LICENSE_CHECK_KEY,
  LICENSE_ID_KEY,
  VERIFIED_EMAIL_KEY,
} from "./config";
import { FN042_ControllaStatoLicenzaFn } from "./accesso.functions";
import { FN008_LeggiChiave, FN009_ScriviChiave, FN014_SalvaMotivoNonValida } from "./stato";
import { useTestiAccesso } from "./testi";

// ======================================================================
// FN047[PortaAccesso]: lascia passare solo chi ha sessione, email verificata, licenza e consenso; rivalida la licenza a ogni cambio rotta.
// ======================================================================
export function FN047_PortaAccesso({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const percorso = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useTestiAccesso();
  const [consentito, setConsentito] = useState(false);

  useEffect(() => {
    let annullato = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (annullato) return;
      if (!data.session || !FN008_LeggiChiave(VERIFIED_EMAIL_KEY)) {
        setConsentito(false);
        navigate({ to: "/auth", replace: true });
        return;
      }
      const licenseId = FN008_LeggiChiave(LICENSE_ID_KEY);
      if (!FN008_LeggiChiave(ACTIVATED_KEY) || !licenseId) {
        setConsentito(false);
        navigate({ to: "/attivazione", replace: true });
        return;
      }
      if (!FN008_LeggiChiave(CONSENT_KEY)) {
        setConsentito(false);
        navigate({ to: "/condizioni", replace: true });
        return;
      }
      try {
        const stato = await FN042_ControllaStatoLicenzaFn({ data: { licenseId } });
        if (annullato) return;
        if (!stato.valida) {
          FN014_SalvaMotivoNonValida(stato.motivo);
          FN003_PulisciChiaviLicenza();
          setConsentito(false);
          navigate({ to: "/licenza-scaduta", replace: true });
          return;
        }
        FN009_ScriviChiave(LAST_LICENSE_CHECK_KEY, new Date().toISOString());
      } catch (errore) {
        // Errore di rete o database transitorio: non si blocca l'utente pagante (fail-open).
        console.error("ERR500: rivalidazione licenza non riuscita", errore);
      }
      if (!annullato) setConsentito(true);
    })();
    return () => {
      annullato = true;
    };
  }, [percorso, navigate]);

  if (!consentito) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-[13px] text-muted-foreground">
        {t("gate.verifica")}
      </div>
    );
  }
  return <>{children}</>;
}
