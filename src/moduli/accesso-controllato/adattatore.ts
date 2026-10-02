// ======================================================================
// Nome File: adattatore.ts
// Percorso: src/moduli/accesso-controllato/adattatore.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:43
// ======================================================================

// Unico punto di contatto fra il modulo e l'app che lo ospita.
// Per portare il modulo su un'altra SaaS si modificano solo questi tre collegamenti.
import { useLingua } from "@/lib/i18n";
import type { LinguaAccesso } from "./tipi";

export { supabase } from "@/integrations/supabase/client";
export { SelettoreLingua } from "@/components/SelettoreLingua";

// ======================================================================
// FN007[useLinguaApp]: restituisce la lingua corrente scelta nell'app ospitante (it, en, de, es).
// ======================================================================
export function useLinguaApp(): LinguaAccesso {
  return useLingua().lingua;
}
