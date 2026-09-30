/**
 * Riduce il logo aziendale prima di salvarlo: lato massimo 800 px e compressione.
 * Il risultato pesa tipicamente 30–60 KB invece di oltre 1 MB, così ogni caricamento
 * della scheda azienda e ogni esportazione JSON restano leggeri.
 */
const LATO_MAX = 800;
const QUALITA = 0.85;

export async function ridimensionaLogo(file: File): Promise<string> {
  const originale = await leggiDataUrl(file);

  // Gli SVG sono già vettoriali e leggeri: restano tali.
  if (file.type === "image/svg+xml") return originale;

  try {
    const img = await caricaImmagine(originale);
    const scala = Math.min(1, LATO_MAX / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scala));
    const h = Math.max(1, Math.round(img.height * scala));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return originale;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);

    // PNG e WebP possono avere trasparenza: si mantiene il PNG, altrimenti JPEG.
    const trasparente = file.type === "image/png" || file.type === "image/webp";
    const ridotto = trasparente
      ? canvas.toDataURL("image/png")
      : canvas.toDataURL("image/jpeg", QUALITA);

    return ridotto.length < originale.length ? ridotto : originale;
  } catch {
    return originale;
  }
}

function leggiDataUrl(file: File): Promise<string> {
  return new Promise((risolvi, rifiuta) => {
    const reader = new FileReader();
    reader.onload = () => risolvi(String(reader.result));
    reader.onerror = () => rifiuta(new Error("lettura file non riuscita"));
    reader.readAsDataURL(file);
  });
}

function caricaImmagine(src: string): Promise<HTMLImageElement> {
  return new Promise((risolvi, rifiuta) => {
    const img = new Image();
    img.onload = () => risolvi(img);
    img.onerror = () => rifiuta(new Error("immagine non valida"));
    img.src = src;
  });
}
