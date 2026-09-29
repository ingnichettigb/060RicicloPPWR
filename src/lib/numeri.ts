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
