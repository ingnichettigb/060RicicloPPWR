// ======================================================================
// Nome File: esterno.server.ts
// Percorso: src/moduli/accesso-controllato/server/esterno.server.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:43
// ======================================================================

// SOLO SERVER. Client verso il database esterno del portfolio (licenze, PUK, utenti, consensi) e verso il database locale.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Client senza tipi generati: le tabelle del portfolio non sono nel types.ts di questa app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClienteLibero = SupabaseClient<any, "public", any>;

function FN018_CreaFetchSupabase(chiave: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    // Le nuove chiavi API Supabase sono stringhe opache, non token JWT.
    if (
      (chiave.startsWith("sb_publishable_") || chiave.startsWith("sb_secret_")) &&
      headers.get("Authorization") === `Bearer ${chiave}`
    ) {
      headers.delete("Authorization");
    }
    headers.set("apikey", chiave);
    return fetch(input, { ...init, headers });
  };
}

let clienteEsterno: ClienteLibero | undefined;

// ======================================================================
// FN019[ClienteEsterno]: crea (una sola volta) il client service-role verso il database esterno del portfolio.
// ======================================================================
export function FN019_ClienteEsterno(): ClienteLibero {
  if (clienteEsterno) return clienteEsterno;
  const url = process.env["EXTERNAL_SUPABASE_URL"];
  const chiave = process.env["EXTERNAL_SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !chiave) {
    throw new Error(
      "ERR500: variabili EXTERNAL_SUPABASE_URL o EXTERNAL_SUPABASE_SERVICE_ROLE_KEY mancanti",
    );
  }
  clienteEsterno = createClient(url, chiave, {
    global: { fetch: FN018_CreaFetchSupabase(chiave) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return clienteEsterno;
}

// ======================================================================
// FN020[ClienteLocale]: restituisce il client admin del database locale (per la tabella lead_emails) senza tipi generati.
// ======================================================================
export function FN020_ClienteLocale(): ClienteLibero {
  return supabaseAdmin as unknown as ClienteLibero;
}
