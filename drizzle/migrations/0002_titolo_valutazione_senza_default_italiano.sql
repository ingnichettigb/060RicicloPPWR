-- Il titolo predefinito non deve più essere imposto in italiano dal database:
-- l'applicazione fornisce sempre il nome nella lingua scelta dall'utente.
ALTER TABLE public.valutazioni ALTER COLUMN titolo SET DEFAULT '';
COMMENT ON COLUMN public.valutazioni.titolo IS 'Nome della valutazione, fornito dall''applicazione nella lingua attiva.';