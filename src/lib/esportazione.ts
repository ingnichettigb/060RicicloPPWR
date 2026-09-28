import { traduci } from "./i18n";
import { AZIENDA_VUOTA, nuovoId, type Azienda, type Componente, type Valutazione } from "./ppwr";

export const VERSIONE_PPWR = "PPWR-1.0";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_LOGO_CHARS = 2_100_000; // ~1,5 MB in base64
const MAX_COMPONENTI = 500;

export type DatiValutazione = Pick<
  Valutazione,
  "titolo" | "revisione" | "data" | "note" | "componenti"
>;

export type Pacchetto = {
  versione: string;
  dataEsportazione: string;
  azienda: Azienda;
  valutazione: DatiValutazione;
};

const due = (n: number) => String(n).padStart(2, "0");

/** Rende il nome sicuro per qualunque file system: rimuove / \ : * ? " < > | e i caratteri di controllo, spazi → "_". */
export function sanificaNome(nome: string): string {
  const s = nome
    .normalize("NFC")
    // eslint-disable-next-line no-control-regex
    .replace(/[/\\:*?"<>|\u0000-\u001f]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 80);
  return s || "valutazione";
}

/** AAMMGGHHmm-PPWR-{Nome}.json  (ora locale) */
export function nomeFileEsportazione(titolo: string, quando = new Date()): string {
  const stamp =
    due(quando.getFullYear() % 100) +
    due(quando.getMonth() + 1) +
    due(quando.getDate()) +
    due(quando.getHours()) +
    due(quando.getMinutes());
  return `${stamp}-PPWR-${sanificaNome(titolo)}.json`;
}

export function costruisciPacchetto(v: DatiValutazione, azienda: Azienda): Pacchetto {
  return {
    versione: VERSIONE_PPWR,
    dataEsportazione: new Date().toISOString(),
    azienda: {
      ragioneSociale: azienda.ragioneSociale,
      partitaIva: azienda.partitaIva,
      indirizzo: azienda.indirizzo,
      referente: azienda.referente,
      email: azienda.email,
      logoDataUrl: azienda.logoDataUrl,
    },
    valutazione: {
      titolo: v.titolo,
      revisione: v.revisione,
      data: v.data,
      note: v.note,
      componenti: v.componenti.map((c) => ({
        id: c.id,
        nome: c.nome,
        materiale: c.materiale,
        peso: c.peso,
        indice: c.indice,
      })),
    },
  };
}

type FileHandleScrivibile = {
  createWritable(): Promise<{
    write(d: Blob): Promise<void>;
    close(): Promise<void>;
  }>;
};
type SaveFilePicker = (o: {
  suggestedName?: string;
  types?: { description?: string; accept: Record<string, string[]> }[];
}) => Promise<FileHandleScrivibile>;

function scaricaConBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Esporta la valutazione in JSON.
 * Chrome/Edge/Opera: finestra di sistema "Salva con nome" (showSaveFilePicker).
 * Altri browser (Firefox, Safari, mobile) o contesti non consentiti: download standard tramite blob URL.
 * Restituisce il nome del file, oppure null se l'utente ha annullato la finestra di salvataggio.
 */
export async function esportaJson(v: DatiValutazione, azienda: Azienda): Promise<string | null> {
  const nome = nomeFileEsportazione(v.titolo);
  const blob = new Blob([JSON.stringify(costruisciPacchetto(v, azienda), null, 2)], {
    type: "application/json",
  });

  const picker = (window as unknown as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
  if (typeof picker === "function") {
    try {
      const handle = await picker.call(window, {
        suggestedName: nome,
        types: [
          {
            description: traduci("json.descrizioneFile"),
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const w = await handle.createWritable();
      await w.write(blob);
      await w.close();
      return nome;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return null;
      // es. SecurityError in un iframe: si passa al download classico
    }
  }
  scaricaConBlob(blob, nome);
  return nome;
}

// ---------- Importazione ----------

const testo = (x: unknown, max: number) => (typeof x === "string" ? x.slice(0, max) : "");

function leggiAzienda(x: unknown): Azienda | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const logo = typeof o["logoDataUrl"] === "string" ? o["logoDataUrl"] : "";
  const a: Azienda = {
    ragioneSociale: testo(o["ragioneSociale"], 200),
    partitaIva: testo(o["partitaIva"], 50),
    indirizzo: testo(o["indirizzo"], 300),
    referente: testo(o["referente"], 200),
    email: testo(o["email"], 255),
    // solo immagini in data URL e di dimensione ragionevole
    logoDataUrl:
      /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(logo) &&
      logo.length <= MAX_LOGO_CHARS
        ? logo
        : "",
  };
  const haDati = Object.values(a).some((v) => v !== "");
  return haDati ? a : null;
}

export function aziendeDiverse(a: Azienda, b: Azienda): boolean {
  return (Object.keys(AZIENDA_VUOTA) as (keyof Azienda)[]).some((k) => a[k] !== b[k]);
}

/** Legge e valida un file JSON PPWR. Lancia Error con messaggio già tradotto. */
export async function leggiPacchetto(file: File): Promise<{
  valutazione: Omit<Valutazione, "id" | "creata">;
  azienda: Azienda | null;
}> {
  if (file.size > MAX_BYTES) throw new Error(traduci("json.errTroppoGrande"));

  let grezzo: unknown;
  try {
    grezzo = JSON.parse(await file.text());
  } catch {
    throw new Error(traduci("json.errFileNonJson"));
  }

  if (!grezzo || typeof grezzo !== "object") throw new Error(traduci("json.errFormato"));
  const p = grezzo as Record<string, unknown>;
  if (typeof p["versione"] !== "string" || !p["versione"].startsWith("PPWR-")) {
    throw new Error(traduci("json.errFormato"));
  }
  const val = p["valutazione"];
  if (!val || typeof val !== "object") throw new Error(traduci("json.errFormato"));
  const o = val as Record<string, unknown>;

  const titolo = testo(o["titolo"], 200).trim();
  const data = typeof o["data"] === "string" ? o["data"].slice(0, 10) : "";
  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(Date.parse(data));
  if (!titolo || !dataValida || !Array.isArray(o["componenti"]) || o["componenti"].length === 0) {
    throw new Error(traduci("json.errCampi"));
  }
  if (o["componenti"].length > MAX_COMPONENTI) throw new Error(traduci("json.errFormato"));

  const componenti: Componente[] = o["componenti"].map((raw, i) => {
    const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const peso = c["peso"];
    const indice = c["indice"];
    if (
      typeof peso !== "number" ||
      !Number.isFinite(peso) ||
      peso < 0 ||
      typeof indice !== "number" ||
      !Number.isFinite(indice) ||
      indice < 0 ||
      indice > 100
    ) {
      throw new Error(traduci("json.errComponente", { n: i + 1 }));
    }
    // ID rigenerato: nessun conflitto con schede già presenti
    return {
      id: nuovoId(),
      nome: testo(c["nome"], 200),
      materiale: testo(c["materiale"], 200),
      peso,
      indice,
    };
  });

  return {
    valutazione: {
      titolo,
      revisione: testo(o["revisione"], 50) || traduci("val.revisioneIniziale"),
      data,
      note: testo(o["note"], 5000),
      componenti,
    },
    azienda: leggiAzienda(p["azienda"]),
  };
}
