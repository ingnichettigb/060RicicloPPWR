// ======================================================================
// Nome File: config.ts
// Percorso: src/moduli/accesso-controllato/config.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:42
// ======================================================================

// Configurazione centrale del modulo. Unico file da personalizzare per ogni nuova SaaS.

export const APP_CODE = "**INSERISCI_QUI_APP_CODE**";
export const APP_NAME = "Riciclabilità PPWR";
export const TERMS_VERSION = "v1";
export const EMAIL_MITTENTE = "**INSERISCI_QUI_MITTENTE_EMAIL**";

export const OTP_SCADENZA_MINUTI = 10;
export const OTP_MAX_RICHIESTE = 3;
export const OTP_FINESTRA_ORE = 24;
export const OTP_MAX_ERRORI = 5;

export const ROTTA_HOME = "/valutazioni" as const;

export const VERIFIED_EMAIL_KEY = `${APP_CODE}:verifiedEmail`;
export const ACTIVATED_KEY = `${APP_CODE}:activated`;
export const LICENSE_ID_KEY = `${APP_CODE}:licenseId`;
export const PUK_ID_KEY = `${APP_CODE}:pukId`;
export const CONSENT_KEY = `${APP_CODE}:consent`;
export const LAST_LICENSE_CHECK_KEY = `${APP_CODE}:lastLicenseCheck`;
export const LICENSE_INVALID_REASON_KEY = `${APP_CODE}:licenseInvalidReason`;

export const GATE_KEYS = [
  VERIFIED_EMAIL_KEY,
  ACTIVATED_KEY,
  LICENSE_ID_KEY,
  PUK_ID_KEY,
  CONSENT_KEY,
  LAST_LICENSE_CHECK_KEY,
] as const;

export const LICENSE_KEYS = [
  ACTIVATED_KEY,
  LICENSE_ID_KEY,
  PUK_ID_KEY,
  CONSENT_KEY,
  LAST_LICENSE_CHECK_KEY,
] as const;

// ======================================================================
// FN002[PulisciChiaviGate]: rimuove dal browser tutte le chiavi di accesso (email, licenza, PUK, consenso).
// ======================================================================
export function FN002_PulisciChiaviGate() {
  if (typeof window === "undefined") return;
  for (const k of GATE_KEYS) window.localStorage.removeItem(k);
}

// ======================================================================
// FN003[PulisciChiaviLicenza]: rimuove le chiavi di licenza lasciando l'email verificata.
// ======================================================================
export function FN003_PulisciChiaviLicenza() {
  if (typeof window === "undefined") return;
  for (const k of LICENSE_KEYS) window.localStorage.removeItem(k);
}
