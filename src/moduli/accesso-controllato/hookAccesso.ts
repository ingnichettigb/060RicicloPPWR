// ======================================================================
// Nome File: hookAccesso.ts
// Percorso: src/moduli/accesso-controllato/hookAccesso.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:43
// ======================================================================

// Hook di protezione delle pagine /attivazione e /condizioni (devono avere sessione ed email verificata).
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "./adattatore";
import { ACTIVATED_KEY, LICENSE_ID_KEY, VERIFIED_EMAIL_KEY } from "./config";
import { FN008_LeggiChiave } from "./stato";

export type LivelloRichiesto = "email" | "licenza";

// ======================================================================
// FN017[useRichiediLivello]: verifica sessione, email verificata e (se richiesto) licenza attivata; altrimenti reindirizza.
// ======================================================================
export function useRichiediLivello(livello: LivelloRichiesto): boolean {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let annullato = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (annullato) return;
      if (!data.session || !FN008_LeggiChiave(VERIFIED_EMAIL_KEY)) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      if (
        livello === "licenza" &&
        (!FN008_LeggiChiave(ACTIVATED_KEY) || !FN008_LeggiChiave(LICENSE_ID_KEY))
      ) {
        navigate({ to: "/attivazione", replace: true });
        return;
      }
      setPronto(true);
    })();
    return () => {
      annullato = true;
    };
  }, [livello, navigate]);

  return pronto;
}
