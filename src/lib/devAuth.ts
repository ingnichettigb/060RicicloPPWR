import { supabase } from "@/integrations/supabase/client";

// Modalità sviluppo: accesso automatico con un account di prova.
// Per riattivare il login reale, imposta AUTO_LOGIN su false.
export const AUTO_LOGIN = true;
export const ACCOUNT_PROVA = { email: "test@ppwr.it", password: "prova123456" };

const CHIAVE_SOSPESO = "ppwr:accesso-sospeso";

/** True quando l'utente ha premuto "Esci": l'accesso automatico resta disattivato. */
export function accessoSospeso(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(CHIAVE_SOSPESO) === "1";
  } catch {
    return false;
  }
}

export function sospendiAccessoAutomatico() {
  try {
    window.sessionStorage.setItem(CHIAVE_SOSPESO, "1");
  } catch {
    /* storage non disponibile */
  }
}

export function riprendiAccessoAutomatico() {
  try {
    window.sessionStorage.removeItem(CHIAVE_SOSPESO);
  } catch {
    /* storage non disponibile */
  }
}

export async function accessoAutomatico() {
  if (!AUTO_LOGIN || accessoSospeso()) return null;
  const { data, error } = await supabase.auth.signInWithPassword(ACCOUNT_PROVA);
  if (error) return null;
  return data.user ?? null;
}

/** Rientro esplicito dalla pagina di accesso (annulla la sospensione). */
export async function entraConAccountProva() {
  riprendiAccessoAutomatico();
  const { data, error } = await supabase.auth.signInWithPassword(ACCOUNT_PROVA);
  if (error) throw error;
  return data.user ?? null;
}
