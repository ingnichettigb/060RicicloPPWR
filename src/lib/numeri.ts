import { getLingua } from "./i18n";
import { LOCALE } from "./traduzioni";

export type Separatore = "," | ".";

/** Separatore decimale della lingua corrente: virgola in IT/DE/ES, punto in EN. */
export function separatoreDecimale(): Separatore {
  const parte = new Intl.NumberFormat(LOCALE[getLingua()])
    .formatToParts(1.1)
    .find((p) => p.type === "decimal");
  return parte?.value === "," ? "," : ".";
}

/** Testo ammesso mentre si scrive: solo cifre, al massimo un separatore (quello della lingua) e due decimali. */
export function testoValido(testo: string, sep: Separatore = separatoreDecimale()): boolean {
  const s = sep === "," ? "," : "\\.";
  return new RegExp(`^\\d{0,9}(${s}\\d{0,2})?$`).test(testo);
}

/** Legge il testo (già validato) come numero; testo vuoto o solo separatore = 0. */
export function daTesto(testo: string, sep: Separatore = separatoreDecimale()): number {
  const n = Number(testo.replace(sep, "."));
  return Number.isFinite(n) ? n : 0;
}

/** Mostra il numero sempre con due decimali e il separatore della lingua (es. 2,50). */
export function aTesto(n: number, sep: Separatore = separatoreDecimale()): string {
  const v = Number.isFinite(n) ? n : 0;
  return (Math.round(v * 100) / 100).toFixed(2).replace(".", sep);
}

/**
 * Normalizza quanto scritto o incollato: accetta punto o virgola come separatore e lo converte in quello
 * della lingua; toglie ogni altro carattere; tiene al massimo due decimali (le cifre in più vengono tolte).
 * Con entrambi i segni (es. "1.234,56") l'ultimo è il decimale; se lo stesso segno si ripete è delle migliaia.
 */
export function normalizzaTesto(grezzo: string, sep: Separatore = separatoreDecimale()): string {
  const s = grezzo.replace(/[^\d.,]/g, "");
  const haPunto = s.includes(".");
  const haVirgola = s.includes(",");
  let posDecimale = -1;
  if (haPunto && haVirgola) {
    posDecimale = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
  } else if (haPunto || haVirgola) {
    const c = haPunto ? "." : ",";
    if (s.split(c).length === 2) posDecimale = s.indexOf(c);
  }
  if (posDecimale < 0) return s.replace(/[.,]/g, "").slice(0, 9);
  const intero = s.slice(0, posDecimale).replace(/[.,]/g, "").slice(0, 9);
  const decimali = s.slice(posDecimale + 1).replace(/[.,]/g, "").slice(0, 2);
  return `${intero}${sep}${decimali}`;
}
