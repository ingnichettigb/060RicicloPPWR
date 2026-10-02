// ======================================================================
// Nome File: stili.ts
// Percorso: src/moduli/accesso-controllato/stili.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:43
// ======================================================================

// Classi Tailwind condivise dalle pagine del modulo (usano i token standard shadcn: background, foreground, primary, ...).

export const CLASSE_ETICHETTA =
  "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";
export const CLASSE_CAMPO =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] outline-none focus:border-ring";
export const CLASSE_PULSANTE =
  "w-full rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-60";
export const CLASSE_PULSANTE_SECONDARIO =
  "w-full rounded-lg border-[1.5px] border-primary px-4 py-2 text-[13px] font-medium hover:bg-accent disabled:opacity-60";
export const CLASSE_ERRORE = "mt-3 text-[12px] text-destructive";
