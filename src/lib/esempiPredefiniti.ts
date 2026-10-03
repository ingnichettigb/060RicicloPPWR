import type { Valutazione } from "./ppwr";
import { nuovoId } from "./ppwr";

type Esempio = Omit<Valutazione, "id" | "creata">;

/** Valutazioni di esempio caricate al primo accesso (senza dati aziendali). */
export function esempiPredefiniti(): Esempio[] {
  const oggi = new Date().toISOString().slice(0, 10);
  const c = (nome: string, materiale: string, peso: number, indice: number) => ({
    id: nuovoId(),
    nome,
    materiale,
    peso,
    indice,
  });
  return [
    {
      titolo: "Tubetto dentifricio",
      revisione: "REV 01",
      data: oggi,
      note: "Esempio",
      componenti: [
        c("Tappo", "Plastica (PP - Polipropilene)", 2, 18),
        c("Strato esterno corpo", "Plastica (LDPE / MDPE)", 4.5, 41),
        c("Strato intermedio (barriera)", "Alluminio (foglio sottile)", 1, 9),
        c("Strato interno corpo", "Plastica (LDPE)", 3.5, 18),
      ],
    },
    {
      titolo: "Bottiglia PET",
      revisione: "REV 01",
      data: oggi,
      note: "Esempio",
      componenti: [
        c("Bottiglia", "PET", 24.5, 100),
        c("Tappo", "HDPE", 2.1, 100),
        c("Etichetta", "Carta metallizzata", 0.8, 0),
      ],
    },
    {
      titolo: "Bottiglia VETRO",
      revisione: "REV 01",
      data: oggi,
      note: "Esempio",
      componenti: [
        c("Bottiglia", "Vetro", 250, 100),
        c("Tappo", "Metallico", 2.1, 100),
        c("Etichetta", "Carta metallizzata", 0.8, 20),
        c("Colla etichetta", "Colla di pesce", 0.01, 100),
      ],
    },
  ];
}
