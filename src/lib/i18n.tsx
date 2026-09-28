import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LINGUE, LOCALE, TRADUZIONI, type Chiave, type Lingua } from "./traduzioni";

const STORAGE_KEY = "lingua";

// Lingua corrente accessibile anche fuori da React (es. formattazione numeri, errori in archivio.ts)
let linguaCorrente: Lingua = "it";

export function getLingua(): Lingua {
  return linguaCorrente;
}

export type Vars = Record<string, string | number>;

function traduciCon(lingua: Lingua, chiave: Chiave, vars?: Vars): string {
  let testo = TRADUZIONI[lingua][chiave] ?? TRADUZIONI.it[chiave] ?? chiave;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) testo = testo.split(`{${k}}`).join(String(v));
  }
  return testo;
}

/** Traduzione utilizzabile fuori dai componenti React. */
export function traduci(chiave: Chiave, vars?: Vars): string {
  return traduciCon(linguaCorrente, chiave, vars);
}

export type T = (chiave: Chiave, vars?: Vars) => string;

type Ctx = { lingua: Lingua; setLingua: (l: Lingua) => void; t: T; locale: string };

const LinguaContext = createContext<Ctx>({
  lingua: "it",
  setLingua: () => {},
  t: (c, v) => traduciCon("it", c, v),
  locale: LOCALE.it,
});

function linguaIniziale(): Lingua {
  try {
    const salvata = localStorage.getItem(STORAGE_KEY);
    if (salvata && (LINGUE as readonly string[]).includes(salvata)) return salvata as Lingua;
  } catch {
    /* storage non disponibile */
  }
  const nav = (typeof navigator !== "undefined" ? navigator.language : "it").slice(0, 2);
  return (LINGUE as readonly string[]).includes(nav) ? (nav as Lingua) : "it";
}

export function LinguaProvider({ children }: { children: ReactNode }) {
  // Si parte da "it" (uguale al server) e si passa alla lingua salvata dopo il mount,
  // per evitare errori di idratazione.
  const [lingua, setLinguaState] = useState<Lingua>("it");
  linguaCorrente = lingua;

  useEffect(() => {
    setLinguaState(linguaIniziale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lingua;
  }, [lingua]);

  const setLingua = useCallback((l: Lingua) => {
    linguaCorrente = l;
    setLinguaState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignora */
    }
  }, []);

  const valore = useMemo<Ctx>(
    () => ({
      lingua,
      setLingua,
      t: (c, v) => traduciCon(lingua, c, v),
      locale: LOCALE[lingua],
    }),
    [lingua, setLingua],
  );

  return <LinguaContext.Provider value={valore}>{children}</LinguaContext.Provider>;
}

export function useLingua() {
  return useContext(LinguaContext);
}

export function useT(): T {
  return useContext(LinguaContext).t;
}

/** Aggiorna il titolo della scheda del browser nella lingua scelta. */
export function useTitoloPagina(chiave: Chiave) {
  const { t, lingua } = useContext(LinguaContext);
  useEffect(() => {
    document.title = t(chiave);
  }, [t, chiave, lingua]);
}
