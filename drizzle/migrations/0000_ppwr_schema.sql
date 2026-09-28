CREATE TABLE public.aziende (
  user_id uuid PRIMARY KEY,
  ragione_sociale text NOT NULL DEFAULT '',
  indirizzo text NOT NULL DEFAULT '',
  partita_iva text NOT NULL DEFAULT '',
  referente text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  logo_data_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aziende TO authenticated;
GRANT ALL ON public.aziende TO service_role;
ALTER TABLE public.aziende ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own azienda select" ON public.aziende FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own azienda insert" ON public.aziende FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own azienda update" ON public.aziende FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own azienda delete" ON public.aziende FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.valutazioni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  titolo text NOT NULL DEFAULT 'Nuova valutazione',
  revisione text NOT NULL DEFAULT 'REV 01',
  data date NOT NULL DEFAULT current_date,
  note text NOT NULL DEFAULT '',
  componenti jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX valutazioni_user_idx ON public.valutazioni(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.valutazioni TO authenticated;
GRANT ALL ON public.valutazioni TO service_role;
ALTER TABLE public.valutazioni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own val select" ON public.valutazioni FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own val insert" ON public.valutazioni FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own val update" ON public.valutazioni FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own val delete" ON public.valutazioni FOR DELETE TO authenticated USING (auth.uid() = user_id);