import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { traduci } from "./i18n";
import { AZIENDA_VUOTA, type Azienda, type Componente, type Valutazione } from "./ppwr";

type RigaVal = {
  id: string;
  titolo: string;
  revisione: string;
  data: string;
  note: string;
  componenti: unknown;
  created_at: string;
};

function daRiga(r: RigaVal): Valutazione {
  return {
    id: r.id,
    titolo: r.titolo,
    revisione: r.revisione,
    data: r.data,
    note: r.note,
    componenti: (Array.isArray(r.componenti) ? r.componenti : []) as Componente[],
    creata: r.created_at,
  };
}

async function utenteId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error(traduci("comune.sessioneScaduta"));
  return data.user.id;
}

export function useValutazioni() {
  const q = useQuery({
    queryKey: ["valutazioni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("valutazioni")
        .select("id,titolo,revisione,data,note,componenti,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as RigaVal[]).map(daRiga);
    },
  });
  return { valutazioni: q.data ?? [], pronto: !q.isLoading, errore: q.error };
}

export function useValutazione(id: string) {
  return useQuery({
    queryKey: ["valutazione", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("valutazioni")
        .select("id,titolo,revisione,data,note,componenti,created_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? daRiga(data as RigaVal) : null;
    },
  });
}

export async function creaValutazione(v: Omit<Valutazione, "id" | "creata">) {
  const user_id = await utenteId();
  const { data, error } = await supabase
    .from("valutazioni")
    .insert({
      user_id,
      titolo: v.titolo,
      revisione: v.revisione,
      data: v.data,
      note: v.note,
      componenti: v.componenti as never,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function aggiornaValutazione(v: Valutazione) {
  const { error } = await supabase
    .from("valutazioni")
    .update({
      titolo: v.titolo,
      revisione: v.revisione,
      data: v.data,
      note: v.note,
      componenti: v.componenti as never,
      updated_at: new Date().toISOString(),
    })
    .eq("id", v.id);
  if (error) throw error;
}

export async function eliminaValutazione(id: string) {
  const { error } = await supabase.from("valutazioni").delete().eq("id", id);
  if (error) throw error;
}

export function useRicaricaValutazioni() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["valutazioni"] });
}

export function useAzienda() {
  const q = useQuery({
    queryKey: ["azienda"],
    queryFn: async (): Promise<Azienda> => {
      const { data, error } = await supabase.from("aziende").select("*").maybeSingle();
      if (error) throw error;
      if (!data) return AZIENDA_VUOTA;
      return {
        ragioneSociale: data.ragione_sociale,
        indirizzo: data.indirizzo,
        partitaIva: data.partita_iva,
        referente: data.referente,
        email: data.email,
        logoDataUrl: data.logo_data_url,
      };
    },
  });
  return { azienda: q.data ?? AZIENDA_VUOTA, pronto: !q.isLoading };
}

export async function salvaAzienda(a: Azienda) {
  const user_id = await utenteId();
  const { error } = await supabase.from("aziende").upsert({
    user_id,
    ragione_sociale: a.ragioneSociale,
    indirizzo: a.indirizzo,
    partita_iva: a.partitaIva,
    referente: a.referente,
    email: a.email,
    logo_data_url: a.logoDataUrl,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
