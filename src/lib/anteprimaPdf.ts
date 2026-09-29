import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Trasforma ogni pagina del PDF in un'immagine (data URL), così l'anteprima
 * si vede in qualunque browser, senza dipendere dal lettore PDF integrato.
 */
export async function pagineComeImmagini(
  blob: Blob,
  annullato: () => boolean = () => false,
  larghezzaPx = 1200,
): Promise<string[]> {
  const data = new Uint8Array(await blob.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const out: string[] = [];
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      if (annullato()) break;
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: larghezzaPx / base.width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas non disponibile");
      await page.render({
        canvasContext: ctx,
        viewport,
        annotationMode: pdfjs.AnnotationMode.ENABLE_STORAGE,
      }).promise;
      out.push(canvas.toDataURL("image/jpeg", 0.92));
    }
  } finally {
    await doc.destroy();
  }
  return out;
}
