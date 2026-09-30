import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { T } from "@/lib/i18n";
import { LOGO_PROGRAMMA_B64 } from "@/lib/logoProgramma";
import { LOCALE } from "@/lib/traduzioni";
import { getLingua } from "@/lib/i18n";
import { etichettaEsito, num, SOGLIE, type Azienda, type Esito, type Valutazione } from "@/lib/ppwr";

export type DatiReport = { t: T; azienda: Azienda; v: Valutazione; e: Esito };

const W = 595.28;
const H = 841.89;
const M = 50;
const CW = W - 2 * M;
const BASSO = 64;

const INK = rgb(0.05, 0.07, 0.1);
const MIST = rgb(0.3, 0.34, 0.4);
const LINE = rgb(0.72, 0.75, 0.79);
const SIGNAL = rgb(0, 0.42, 0.33);
const DANGER = rgb(0.72, 0.15, 0.08);
const PAPER = rgb(0.97, 0.98, 0.99);
const CAMPO = rgb(0.94, 0.97, 1);

/** Genera il report PDF (A4) con copertina e campi modificabili (luogo, data, referente). */
export async function generaPdf({ t, azienda, v, e }: DatiReport): Promise<Blob> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${t("rep.titolo")} — ${v.titolo}`);
  pdf.setAuthor(azienda.ragioneSociale);
  pdf.setCreator("Riciclabilità PPWR");
  const f = await pdf.embedFont(StandardFonts.Helvetica);
  const fb = await pdf.embedFont(StandardFonts.HelveticaBold);
  const form = pdf.getForm();
  const ammessi = new Set(f.getCharacterSet());

  // Il font standard PDF copre solo il set WinAnsi: sostituisce ciò che non può disegnare.
  const safe = (s: string) =>
    Array.from(s.replace(/≥/g, ">=").replace(/≤/g, "<=").replace(/[‐‑–]/g, "-"))
      .map((c) => (c === "\n" || ammessi.has(c.codePointAt(0) ?? 0) ? c : "?"))
      .join("");

  const righe = (s: string, font: PDFFont, size: number, max: number): string[] => {
    const out: string[] = [];
    for (const par of safe(s).split("\n")) {
      let riga = "";
      for (const parola of par.split(/\s+/).filter(Boolean)) {
        const prova = riga ? `${riga} ${parola}` : parola;
        if (font.widthOfTextAtSize(prova, size) <= max) riga = prova;
        else {
          if (riga) out.push(riga);
          riga = parola;
        }
      }
      out.push(riga);
    }
    return out;
  };

  const testo = (
    p: PDFPage,
    s: string,
    x: number,
    y: number,
    o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; dx?: boolean } = {},
  ) => {
    const font = o.font ?? f;
    const size = o.size ?? 10;
    const c = safe(s);
    const px = o.dx ? x - font.widthOfTextAtSize(c, size) : x;
    p.drawText(c, { x: px, y, font, size, color: o.color ?? INK });
  };

  const centrato = (
    pg: PDFPage,
    s: string,
    yy: number,
    o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {},
  ) => {
    const font = o.font ?? f;
    const size = o.size ?? 10;
    testo(pg, s, (W - font.widthOfTextAtSize(safe(s), size)) / 2, yy, o);
  };

  // Data di generazione del PDF, nel formato della lingua corrente.
  const dataOggi = new Date().toLocaleDateString(LOCALE[getLingua()], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Logo del programma, sempre incorporato.
  const logoProgramma = await pdf.embedJpg(Uint8Array.from(atob(LOGO_PROGRAMMA_B64), (ch) => ch.charCodeAt(0)));

  // Logo (PNG o JPG); altri formati vengono ignorati.
  let logo: Awaited<ReturnType<typeof pdf.embedPng>> | null = null;
  const m = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(azienda.logoDataUrl || "");
  if (m) {
    try {
      const bytes = Uint8Array.from(atob(m[2] ?? ""), (ch) => ch.charCodeAt(0));
      logo = (m[1] ?? "").toLowerCase() === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    } catch {
      logo = null;
    }
  }

  const nomeAzienda = azienda.ragioneSociale || t("rep.aziendaNonImpostata");

  // ───────────── Copertina ─────────────
  {
    const p = pdf.addPage([W, H]);
    p.drawRectangle({ x: 0, y: H - 14, width: W, height: 14, color: SIGNAL });
    const yTesta = H - 62;
    let y = yTesta;
    if (logo) {
      const d = logo.scaleToFit(200, 80);
      y -= d.height;
      p.drawImage(logo, { x: M, y, width: d.width, height: d.height });
      y -= 26;
    }
    testo(p, nomeAzienda, M, y, { font: fb, size: 15 });
    let fondoTesta = y - 14;

    // Dati aziendali in alto a destra, all'altezza di logo e nome dell'azienda
    const dati = [
      azienda.indirizzo,
      azienda.partitaIva && t("rep.piva", { v: azienda.partitaIva }),
      azienda.referente,
      azienda.email,
    ].filter(Boolean) as string[];
    let yd = logo ? yTesta - 9 : yTesta;
    for (const d of dati) {
      for (const r of righe(d, f, 9.5, 230)) {
        testo(p, r, W - M, yd, { size: 9.5, color: MIST, dx: true });
        yd -= 15;
      }
    }
    fondoTesta = Math.min(fondoTesta, yd + 15 - 10);

    // Riquadro con la percentuale, in basso
    const hb = 86;
    const yb = 110;

    // Blocco centrale, centrato in verticale tra testata e riquadro
    const rTitolo = righe(t("rep.titolo"), fb, 26, CW);
    const rProdotto = righe(v.titolo, fb, 24, CW);
    const dl = logoProgramma.scaleToFit(140, 140);
    const totale = 21 + 68 + rTitolo.length * 32 + rProdotto.length * 30 + 6 + dl.height;
    const sopra = fondoTesta - 20;
    const sotto = yb + hb + 20;
    const slack = Math.max(0, sopra - sotto - totale);
    y = sopra - slack / 2 - 21;

    p.drawRectangle({ x: (W - 40) / 2, y: y + 18, width: 40, height: 3, color: SIGNAL });
    centrato(p, t("rep.norma").toUpperCase(), y, { font: fb, size: 9, color: SIGNAL });
    y -= 40;
    for (const r of rTitolo) {
      centrato(p, r, y, { font: fb, size: 26, color: SIGNAL });
      y -= 32;
    }
    y -= 28;

    // Nome del prodotto/imballaggio in evidenza, centrato, sopra il logo del programma
    for (const r of rProdotto) {
      centrato(p, r, y, { font: fb, size: 24 });
      y -= 30;
    }
    y -= 6;
    p.drawImage(logoProgramma, { x: (W - dl.width) / 2, y: y - dl.height, width: dl.width, height: dl.height });

    // Revisione e data in fondo alla pagina, a sinistra
    testo(p, `${v.revisione} · ${v.data}`, M, 50, { size: 11, color: MIST });

    const colore = e.conforme ? SIGNAL : DANGER;
    p.drawRectangle({
      x: M,
      y: yb,
      width: CW,
      height: hb,
      color: PAPER,
      borderColor: LINE,
      borderWidth: 1,
    });
    testo(p, t("rep.ricic").toUpperCase(), M + 20, yb + hb - 24, { size: 8, color: MIST });
    testo(p, `${num(e.percentuale)}%`, M + 20, yb + 22, { font: fb, size: 36, color: colore });
    p.drawLine({
      start: { x: M + 190, y: yb + 14 },
      end: { x: M + 190, y: yb + hb - 14 },
      thickness: 1,
      color: LINE,
    });
    testo(p, etichettaEsito(e, t), M + 210, yb + hb - 38, { font: fb, size: 13 });
    testo(p, t("rep.statoAmmissibilita", { stato: t(e.stato) }), M + 210, yb + 24, {
      size: 9.5,
      color: MIST,
    });
  }

  // ───────────── Pagine di contenuto ─────────────
  let p!: PDFPage;
  let y = 0;
  const nuovaPagina = () => {
    p = pdf.addPage([W, H]);
    testo(p, nomeAzienda, M, H - 34, { font: fb, size: 8, color: MIST });
    testo(p, `${v.titolo} · ${v.revisione}`, W - M, H - 34, { size: 8, color: MIST, dx: true });
    p.drawLine({ start: { x: M, y: H - 42 }, end: { x: W - M, y: H - 42 }, thickness: 0.75, color: LINE });
    y = H - 72;
  };
  const ensure = (h: number) => {
    if (y - h < BASSO) nuovaPagina();
  };
  const sezione = (titolo: string, minimo = 60) => {
    ensure(minimo + 30);
    y -= 30;
    testo(p, titolo, M, y, { font: fb, size: 12 });
    y -= 6;
  };

  nuovaPagina();
  y -= 8;
  for (const r of righe(t("rep.titolo"), fb, 17, CW)) {
    testo(p, r, M, y, { font: fb, size: 17 });
    y -= 22;
  }
  testo(p, `${v.titolo} · ${v.revisione} · ${v.data}`, M, y, { size: 9.5, color: MIST });
  y -= 10;
  for (const r of righe(t("rep.intro"), f, 10, CW)) {
    y -= 14;
    testo(p, r, M, y, { size: 10 });
  }

  // 1. Bilancio di massa
  const col = {
    nome: { x: M, w: 185 },
    mat: { x: M + 195, w: 105 },
    peso: { dx: M + 365 },
    indice: { dx: M + 430 },
    massa: { dx: M + CW },
  };
  const intestazioneTabella = () => {
    const hs = [
      righe(t("ed.colComponente").toUpperCase(), fb, 7, col.nome.w),
      righe(t("ed.colMateriale").toUpperCase(), fb, 7, col.mat.w),
      righe(t("ed.colPeso").toUpperCase(), fb, 7, 60),
      righe(t("rep.colIndice").toUpperCase(), fb, 7, 60),
      righe(t("ed.colMassaRicic").toUpperCase(), fb, 7, 62),
    ];
    const n = Math.max(...hs.map((h) => h.length));
    y -= 16;
    const opz = { font: fb, size: 7, color: MIST };
    for (let i = 0; i < n; i++) {
      const yy = y - i * 9;
      const cella = (k: number) => hs[k]?.[i] ?? "";
      if (cella(0)) testo(p, cella(0), col.nome.x, yy, opz);
      if (cella(1)) testo(p, cella(1), col.mat.x, yy, opz);
      if (cella(2)) testo(p, cella(2), col.peso.dx, yy, { ...opz, dx: true });
      if (cella(3)) testo(p, cella(3), col.indice.dx, yy, { ...opz, dx: true });
      if (cella(4)) testo(p, cella(4), col.massa.dx, yy, { ...opz, dx: true });
    }
    y -= (n - 1) * 9 + 8;
    p.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.75, color: LINE });
  };

  sezione(t("rep.s1"), 70);
  intestazioneTabella();
  for (const c of v.componenti) {
    const nome = righe(c.nome, f, 9.5, col.nome.w);
    const mat = righe(c.materiale, f, 9, col.mat.w);
    const h = Math.max(nome.length, mat.length) * 12 + 8;
    if (y - h < BASSO) {
      nuovaPagina();
      y -= 8;
      intestazioneTabella();
    }
    const top = y - 15;
    nome.forEach((r, i) => testo(p, r, col.nome.x, top - i * 12, { size: 9.5 }));
    mat.forEach((r, i) => testo(p, r, col.mat.x, top - i * 12, { size: 9 }));
    testo(p, num(c.peso), col.peso.dx, top, { size: 9, dx: true });
    testo(p, num(c.indice, 1), col.indice.dx, top, { size: 9, dx: true });
    testo(p, num((c.peso * c.indice) / 100), col.massa.dx, top, { size: 9, dx: true });
    y -= h;
    p.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: LINE });
  }
  ensure(26);
  y -= 17;
  testo(p, t("rep.totaleImballaggio"), col.nome.x, y, { font: fb, size: 9.5, color: MIST });
  testo(p, num(e.pesoTotale), col.peso.dx, y, { font: fb, size: 9, dx: true });
  testo(p, num(e.massaRiciclabile), col.massa.dx, y, { font: fb, size: 9, dx: true });

  // 2. Esito del calcolo
  sezione(t("rep.s2"), 80);
  {
    const hb = 70;
    const yb = y - 10 - hb;
    const colore = e.conforme ? SIGNAL : DANGER;
    p.drawRectangle({ x: M, y: yb, width: CW, height: hb, color: PAPER, borderColor: LINE, borderWidth: 1 });
    testo(p, t("rep.ricic").toUpperCase(), M + 16, yb + hb - 20, { size: 7.5, color: MIST });
    testo(p, `${num(e.percentuale)}%`, M + 16, yb + 16, { font: fb, size: 28, color: colore });
    p.drawLine({ start: { x: M + 150, y: yb + 12 }, end: { x: M + 150, y: yb + hb - 12 }, thickness: 1, color: LINE });
    testo(p, etichettaEsito(e, t), M + 168, yb + hb - 30, { font: fb, size: 11 });
    testo(p, t("rep.statoAmmissibilita", { stato: t(e.stato) }), M + 168, yb + 20, { size: 9, color: MIST });
    y = yb;
  }

  // 3. Classi di prestazione
  sezione(t("rep.s3"), 4 * 22);
  {
    const righeTab: [string, string, string][] = [
      ...SOGLIE.map((s) => [`${t("grado.label")} ${s.grado}`, `≥ ${s.min}%`, t(s.stato)] as [string, string, string]),
      [t("esito.nonConforme"), "< 70%", t("stato.nonAmmesso")],
    ];
    y -= 4;
    for (const [a, b, c] of righeTab) {
      y -= 16;
      testo(p, a, M, y, { font: fb, size: 9.5 });
      testo(p, b, M + 130, y, { size: 9.5 });
      testo(p, c, M + 220, y, { size: 9.5, color: MIST });
      y -= 6;
      p.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: LINE });
    }
  }

  // 4. Note tecniche
  if (v.note) {
    sezione(t("rep.s4"), 40);
    for (const r of righe(v.note, f, 10, CW)) {
      ensure(16);
      y -= 14;
      testo(p, r, M, y, { size: 10 });
    }
  }

  // ───────────── Luogo, data e firma (sempre intero: se non entra va a pagina nuova) ─────────────
  ensure(230);
  y -= 34;
  testo(p, t("rep.firmaTitolo"), M, y, { font: fb, size: 12 });
  y -= 10;

  const campo = (nome: string, x: number, yy: number, w: number, valore = "") => {
    const c = form.createTextField(nome);
    if (valore) c.setText(safe(valore));
    c.addToPage(p, {
      x,
      y: yy,
      width: w,
      height: 22,
      borderColor: SIGNAL,
      borderWidth: 0.75,
      backgroundColor: CAMPO,
      textColor: INK,
    });
    c.setFontSize(10);
  };
  const etichetta = (s: string, x: number, yy: number) =>
    testo(p, s.toUpperCase(), x, yy, { font: fb, size: 7.5, color: MIST });

  y -= 22;
  etichetta(t("rep.luogo"), M, y);
  etichetta(t("rep.data"), M + 270, y);
  campo("luogo", M, y - 30, 240);
  campo("data", M + 270, y - 30, 150, dataOggi);

  y -= 30 + 34;
  campo("referente", M, y - 30, 240, azienda.referente);
  testo(p, nomeAzienda, M, y - 44, { size: 9, color: MIST });
  etichetta(t("rep.firma"), M + 270, y);
  p.drawRectangle({ x: M + 270, y: y - 72, width: CW - 270, height: 66, borderColor: LINE, borderWidth: 1 });

  form.updateFieldAppearances(f);

  // Piè di pagina con numerazione (copertina esclusa)
  const pagine = pdf.getPages();
  const nota = righe(t("rep.footer", { azienda: azienda.ragioneSociale || t("rep.aziendaNonImpostataMin") }), f, 7, CW - 90);
  pagine.forEach((pg, i) => {
    if (i === 0) return;
    nota.slice(0, 2).forEach((r, k) => testo(pg, r, M, 34 - k * 9, { size: 7, color: MIST }));
    testo(pg, t("rep.pagina", { n: i + 1, tot: pagine.length }), W - M, 34, { size: 8, color: MIST, dx: true });
  });

  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

/** AAMMGGHHmm-report-PPWR-{titolo}-{revisione}.pdf  (ora locale, come il nome del file JSON) */
export function nomeFile(v: Valutazione, quando = new Date()) {
  const due = (n: number) => String(n).padStart(2, "0");
  const stamp =
    due(quando.getFullYear() % 100) +
    due(quando.getMonth() + 1) +
    due(quando.getDate()) +
    due(quando.getHours()) +
    due(quando.getMinutes());
  const base = `${v.titolo}-${v.revisione}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${stamp}-report-PPWR-${base || "riciclabilita"}.pdf`;
}

/** Genera il PDF e ne avvia il download nel browser. */
export async function scaricaPdf(d: DatiReport) {
  const blob = await generaPdf(d);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeFile(d.v);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
