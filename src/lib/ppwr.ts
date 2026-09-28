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

export const SOGLIE = [
  { grado: "A", min: 95, etichetta: "Grado A — Eccellenza", stato: "Ammesso" },
  { grado: "B", min: 80, etichetta: "Grado B — Alta riciclabilità", stato: "Ammesso" },
  { grado: "C", min: 70, etichetta: "Grado C — Soglia minima di ammissibilità", stato: "Ammesso" },
] as const;

export type Esito = {
  pesoTotale: number;
  massaRiciclabile: number;
  percentuale: number;
  grado: string;
  etichetta: string;
  stato: string;
  conforme: boolean;
};

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
    etichetta: soglia ? soglia.etichetta : "Non conforme",
    stato: soglia ? soglia.stato : "Non ammesso",
    conforme: Boolean(soglia),
  };
}

export function num(valore: number, decimali = 2) {
  return valore.toLocaleString("it-IT", {
    minimumFractionDigits: decimali,
    maximumFractionDigits: decimali,
  });
}

export function nuovoId() {
  return Math.random().toString(36).slice(2, 10);
}

export function valutazioneVuota(): Omit<Valutazione, "id" | "creata"> {
  return {
    titolo: "Nuova valutazione",
    revisione: "REV 01",
    data: new Date().toISOString().slice(0, 10),
    note: "",
    componenti: [
      { id: nuovoId(), nome: "Bottiglia", materiale: "PET", peso: 24.5, indice: 100 },
      { id: nuovoId(), nome: "Tappo", materiale: "HDPE", peso: 2.1, indice: 100 },
      { id: nuovoId(), nome: "Etichetta", materiale: "Carta metallizzata", peso: 0.8, indice: 0 },
    ],
  };
}
