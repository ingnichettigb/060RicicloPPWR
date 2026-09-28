import { supabase } from "@/integrations/supabase/client";

// Modalità sviluppo: accesso automatico con un account di prova.
// Per riattivare il login reale, imposta AUTO_LOGIN su false.
export const AUTO_LOGIN = true;
export const ACCOUNT_PROVA = { email: "test@ppwr.it", password: "prova123456" };

export async function accessoAutomatico() {
  if (!AUTO_LOGIN) return null;
  const { data, error } = await supabase.auth.signInWithPassword(ACCOUNT_PROVA);
  if (error) return null;
  return data.user ?? null;
}
