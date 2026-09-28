import { getLingua, type T } from "./i18n";
import { LOCALE, type Chiave } from "./traduzioni";

export type Componente = {
  id: string;
  nome: string;
  materiale: string;
  peso: number;
  indice: number;
};

export type Valutazione = {
  id: string;
  titolo: string;
  revisione: string;
  data: string;
  note: string;
  componenti: Componente[];
  creata: string;
};

export type Azienda = {
  ragioneSociale: string;
  indirizzo: string;
  partitaIva: string;
  referente: string;
  email: string;
  logoDataUrl: string;
};

export const AZIENDA_VUOTA: Azienda = {
  ragioneSociale: "",
  indirizzo: "",
  partitaIva: "",
  referente: "",
  email: "",
  logoDataUrl: "",
};

export const SOGLIE: readonly { grado: string; min: number; nome: Chiave; stato: Chiave }[] = [
  { grado: "A", min: 95, nome: "grado.A", stato: "stato.ammesso" },
  { grado: "B", min: 80, nome: "grado.B", stato: "stato.ammesso" },
  { grado: "C", min: 70, nome: "grado.C", stato: "stato.ammesso" },
];

export type Esito = {
  pesoTotale: number;
  massaRiciclabile: number;
  percentuale: number;
  grado: string;
  /** chiave di traduzione del nome del grado */
  nome: Chiave;
  /** chiave di traduzione dello stato di ammissibilità */
  stato: Chiave;
  conforme: boolean;
};

/** Es. "Grado A — Eccellenza" oppure "Non conforme", nella lingua corrente. */
export function etichettaEsito(e: Esito, t: T): string {
  return e.conforme ? `${t("grado.label")} ${e.grado} — ${t(e.nome)}` : t(e.nome);
}

export function calcola(componenti: Componente[]): Esito {
  const pesoTotale = componenti.reduce((s, c) => s + (Number(c.peso) || 0), 0);
  const massaRiciclabile = componenti.reduce(
    (s, c) => s + ((Number(c.peso) || 0) * (Number(c.indice) || 0)) / 100,
    0,
  );
  const percentuale = pesoTotale > 0 ? (massaRiciclabile / pesoTotale) * 100 : 0;
  const soglia = SOGLIE.find((s) => percentuale >= s.min);

  return {
    pesoTotale,
    massaRiciclabile,
    percentuale,
    grado: soglia ? soglia.grado : "—",
    nome: soglia ? soglia.nome : "esito.nonConforme",
    stato: soglia ? soglia.stato : "stato.nonAmmesso",
    conforme: Boolean(soglia),
  };
}

export function num(valore: number, decimali = 2) {
  return valore.toLocaleString(LOCALE[getLingua()], {
    minimumFractionDigits: decimali,
    maximumFractionDigits: decimali,
  });
}

export function nuovoId() {
  return Math.random().toString(36).slice(2, 10);
}

export function valutazioneVuota(t: T): Omit<Valutazione, "id" | "creata"> {
  return {
    titolo: t("val.nuova"),
    revisione: t("val.revisioneIniziale"),
    data: new Date().toISOString().slice(0, 10),
    note: "",
    componenti: [
      { id: nuovoId(), nome: t("demo.bottiglia"), materiale: "PET", peso: 24.5, indice: 100 },
      { id: nuovoId(), nome: t("demo.tappo"), materiale: "HDPE", peso: 2.1, indice: 100 },
      {
        id: nuovoId(),
        nome: t("demo.etichetta"),
        materiale: t("demo.cartaMetallizzata"),
        peso: 0.8,
        indice: 0,
      },
    ],
  };
}
