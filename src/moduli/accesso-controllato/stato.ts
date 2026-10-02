// ======================================================================
// Nome File: stato.ts
// Percorso: src/moduli/accesso-controllato/stato.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:43
// ======================================================================

// Gestione del localStorage del modulo e dell'uscita "cancella tutto". Tutte le chiavi hanno il prefisso APP_CODE.
import { supabase } from "./adattatore";
import {
  ACTIVATED_KEY,
  CONSENT_KEY,
  FN002_PulisciChiaviGate,
  FN003_PulisciChiaviLicenza,
  LAST_LICENSE_CHECK_KEY,
  LICENSE_ID_KEY,
  LICENSE_INVALID_REASON_KEY,
  PUK_ID_KEY,
  VERIFIED_EMAIL_KEY,
} from "./config";
import type { MotivoNonValida } from "./tipi";

// ======================================================================
// FN008[LeggiChiave]: legge una chiave dal localStorage senza mai generare errori.
// ======================================================================
export function FN008_LeggiChiave(chiave: string): string | null {
  try {
    return window.localStorage.getItem(chiave);
  } catch {
    return null;
  }
}

// ======================================================================
// FN009[ScriviChiave]: scrive una chiave nel localStorage senza mai generare errori.
// ======================================================================
export function FN009_ScriviChiave(chiave: string, valore: string) {
  try {
    window.localStorage.setItem(chiave, valore);
  } catch {
    /* storage non disponibile */
  }
}

// ======================================================================
// FN010[RimuoviChiave]: rimuove una chiave dal localStorage senza mai generare errori.
// ======================================================================
export function FN010_RimuoviChiave(chiave: string) {
  try {
    window.localStorage.removeItem(chiave);
  } catch {
    /* storage non disponibile */
  }
}

// ======================================================================
// FN011[SalvaEmailVerificata]: salva l'email verificata; se è diversa dalla precedente azzera i dati di licenza.
// ======================================================================
export function FN011_SalvaEmailVerificata(email: string) {
  const precedente = FN008_LeggiChiave(VERIFIED_EMAIL_KEY);
  if (precedente && precedente !== email) FN003_PulisciChiaviLicenza();
  FN009_ScriviChiave(VERIFIED_EMAIL_KEY, email);
  FN010_RimuoviChiave(LICENSE_INVALID_REASON_KEY);
}

// ======================================================================
// FN012[SalvaAttivazione]: salva licenza e PUK dopo l'attivazione riuscita.
// ======================================================================
export function FN012_SalvaAttivazione(licenseId: string, pukId: string) {
  FN009_ScriviChiave(ACTIVATED_KEY, "true");
  FN009_ScriviChiave(LICENSE_ID_KEY, licenseId);
  FN009_ScriviChiave(PUK_ID_KEY, pukId);
  FN010_RimuoviChiave(CONSENT_KEY);
  FN010_RimuoviChiave(LICENSE_INVALID_REASON_KEY);
  FN009_ScriviChiave(LAST_LICENSE_CHECK_KEY, new Date().toISOString());
}

// ======================================================================
// FN013[SalvaConsenso]: segna come accettate le condizioni d'uso su questo dispositivo.
// ======================================================================
export function FN013_SalvaConsenso() {
  FN009_ScriviChiave(CONSENT_KEY, "true");
}

// ======================================================================
// FN014[SalvaMotivoNonValida]: memorizza il motivo per cui la licenza non è più valida.
// ======================================================================
export function FN014_SalvaMotivoNonValida(motivo: MotivoNonValida) {
  FN009_ScriviChiave(LICENSE_INVALID_REASON_KEY, motivo);
}

// ======================================================================
// FN015[LeggiMotivoNonValida]: legge il motivo di licenza non valida (expired, deactivated, not_found).
// ======================================================================
export function FN015_LeggiMotivoNonValida(): MotivoNonValida {
  const valore = FN008_LeggiChiave(LICENSE_INVALID_REASON_KEY);
  return valore === "expired" || valore === "deactivated" ? valore : "not_found";
}

// ======================================================================
// FN016[EsciECancellaTutto]: azzera le chiavi del modulo e la sessione del browser ed esegue il logout (senza localStorage.clear).
// ======================================================================
export async function FN016_EsciECancellaTutto() {
  FN002_PulisciChiaviGate();
  FN010_RimuoviChiave(LICENSE_INVALID_REASON_KEY);
  try {
    window.sessionStorage.clear();
  } catch {
    /* storage non disponibile */
  }
  await supabase.auth.signOut();
}
