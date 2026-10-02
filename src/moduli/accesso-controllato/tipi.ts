// ======================================================================
// Nome File: tipi.ts
// Percorso: src/moduli/accesso-controllato/tipi.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:42
// ======================================================================

// Tipi condivisi fra server e client (solo tipi: nessun codice eseguibile).
import type { CodiceErrore } from "./errori";

export type LinguaAccesso = "it" | "en" | "de" | "es";
export type MotivoNonValida = "expired" | "deactivated" | "not_found";

export type Errore = { ok: false; codice: CodiceErrore };

export type EsitoRichiestaOtp = { ok: true; scadenzaMinuti: number } | Errore;
export type EsitoVerificaOtp = { ok: true; tokenHash: string; email: string } | Errore;
export type EsitoAttivazione =
  { ok: true; licenseId: string; pukId: string; riattivata: boolean } | Errore;
export type StatoLicenza = { valida: true } | { valida: false; motivo: MotivoNonValida };
export type EsitoConsenso = { ok: true } | Errore;
export type EsitoDecremento =
  { ok: true; consentito: boolean; remaining: number | null; esaurito: boolean } | Errore;
