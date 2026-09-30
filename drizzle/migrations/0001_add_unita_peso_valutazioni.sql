ALTER TABLE public.valutazioni
  ADD COLUMN IF NOT EXISTS unita_peso text NOT NULL DEFAULT 'g';

UPDATE public.valutazioni SET unita_peso = 'g' WHERE unita_peso IS NULL OR unita_peso NOT IN ('g','kg','t');

ALTER TABLE public.valutazioni
  DROP CONSTRAINT IF EXISTS valutazioni_unita_peso_check;

ALTER TABLE public.valutazioni
  ADD CONSTRAINT valutazioni_unita_peso_check CHECK (unita_peso IN ('g','kg','t'));