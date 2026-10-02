// ======================================================================
// Nome File: useExportQuota.tsx
// Percorso: src/moduli/accesso-controllato/esportazione/useExportQuota.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Hook della quota export PDF per singolo PUK. consume() va chiamato subito prima di generare il file PDF.
import { useCallback, useEffect, useRef, useState } from "react";
import { PUK_ID_KEY } from "../config";
import { FN004_FormattaErrore } from "../errori";
import { FN045_LeggiQuotaPdfFn, FN046_DecrementaQuotaPdfFn } from "../accesso.functions";
import { FN008_LeggiChiave } from "../stato";
import { FN061_DialogExportEsauriti } from "./DialogExportEsauriti";

// ======================================================================
// FN058[useExportQuota]: legge la quota PDF del PUK e fornisce remaining, blocked, showLastExportWarning, consume() e il dialog di plafond esaurito.
// ======================================================================
export function useExportQuota() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [dialogAperto, setDialogAperto] = useState(false);
  const inVolo = useRef(false);

  useEffect(() => {
    const pukId = FN008_LeggiChiave(PUK_ID_KEY);
    if (!pukId) return;
    let annullato = false;
    FN045_LeggiQuotaPdfFn({ data: { pukId } })
      .then((r) => {
        if (!annullato) setRemaining(r.remaining);
      })
      .catch(() => {
        /* fail-open: nessun blocco se la lettura fallisce */
      });
    return () => {
      annullato = true;
    };
  }, []);

  // ======================================================================
  // FN059[ConsumaExport]: scala un export PDF sul server (anti doppio clic); restituisce true se si può generare il PDF, false se bloccato.
  // ======================================================================
  const consume = useCallback(async (): Promise<boolean> => {
    if (inVolo.current) return false;
    const pukId = FN008_LeggiChiave(PUK_ID_KEY);
    if (!pukId) return true;
    inVolo.current = true;
    try {
      const esito = await FN046_DecrementaQuotaPdfFn({ data: { pukId } });
      if (!esito.ok) {
        console.error(FN004_FormattaErrore(esito.codice));
        return true; // fail-open: un errore tecnico non blocca l'utente
      }
      setRemaining(esito.remaining);
      if (!esito.consentito) {
        setDialogAperto(true);
        return false;
      }
      return true;
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return true;
    } finally {
      inVolo.current = false;
    }
  }, []);

  return {
    remaining,
    blocked: remaining !== null && remaining <= 0,
    showLastExportWarning: remaining === 1,
    consume,
    dialog: (
      <FN061_DialogExportEsauriti aperto={dialogAperto} onChiudi={() => setDialogAperto(false)} />
    ),
  };
}
