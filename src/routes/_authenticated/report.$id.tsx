import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Intestazione } from "@/components/Intestazione";
import { useLingua, useTitoloPagina } from "@/lib/i18n";
import { useAzienda, useValutazione } from "@/lib/archivio";
import { calcola } from "@/lib/ppwr";

export const Route = createFileRoute("/_authenticated/report/$id")({
  head: () => ({
    meta: [
      { title: "Report di riciclabilità — Riciclabilità PPWR" },
      {
        name: "description",
        content:
          "Report tecnico stampabile con bilancio di massa, percentuale di riciclabilità e grado PPWR, intestato con i dati aziendali.",
      },
      { property: "og:title", content: "Report di riciclabilità — Riciclabilità PPWR" },
      {
        property: "og:description",
        content:
          "Documento di valutazione conforme al Regolamento UE 2025/40, pronto per la stampa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Report,
});

function Report() {
  const { t, lingua } = useLingua();
  useTitoloPagina("rep.titoloPagina");
  const { id } = useParams({ from: "/_authenticated/report/$id" });
  const { azienda } = useAzienda();
  const { data: v, isLoading } = useValutazione(id);
  const [pagine, setPagine] = useState<string[] | "errore" | null>(null);

  // L'anteprima è il PDF vero (stesso codice del download), mostrato pagina per pagina come immagini.
  useEffect(() => {
    if (!v) return;
    let annullato = false;
    setPagine(null);
    (async () => {
      try {
        const { generaPdf } = await import("@/lib/pdfReport");
        const { pagineComeImmagini } = await import("@/lib/anteprimaPdf");
        const blob = await generaPdf({ t, azienda, v, e: calcola(v.componenti) });
        const immagini = await pagineComeImmagini(blob, () => annullato);
        if (!annullato) setPagine(immagini);
      } catch (err) {
        console.error("Anteprima PDF non riuscita", err);
        if (!annullato) setPagine("errore");
      }
    })();
    return () => {
      annullato = true;
    };
  }, [v, azienda, lingua]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!v) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <div className="mx-auto max-w-[1180px] px-6 py-7">
          <Intestazione />
          <p className="mt-10 text-[13px] text-mist">
            {isLoading ? t("comune.caricamento") : t("comune.nonTrovata")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione
          azione={
            <button
              type="button"
              onClick={async () => {
                try {
                  const { scaricaPdf } = await import("@/lib/pdfReport");
                  await scaricaPdf({ t, azienda, v, e: calcola(v.componenti) });
                } catch (err) {
                  console.error("Download PDF non riuscito", err);
                  window.alert(t("rep.errScarica"));
                }
              }}
              className="ml-2 rounded-lg border-[1.5px] border-signal bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
            >
              {t("rep.stampa")}
            </button>
          }
        />

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <h1 className="font-display text-[19px] font-semibold leading-tight">
            {t("rep.anteprima")}
          </h1>
          <Link
            to="/valutazione/$id"
            params={{ id: v.id }}
            className="font-mono text-[11px] text-mist hover:text-ink"
          >
            {t("rep.torna")}
          </Link>
        </div>

        <p className="mt-2 max-w-[900px] text-[12px] text-mist">{t("rep.notaAnteprima")}</p>

        <div className="mx-auto mt-4 flex max-w-[900px] flex-col gap-4">
          {Array.isArray(pagine) ? (
            pagine.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${t("rep.anteprima")} ${i + 1}`}
                className="block h-auto w-full rounded-lg bg-white ring-1 ring-black/10"
              />
            ))
          ) : (
            <p className="grid h-[40vh] place-items-center rounded-xl bg-white px-6 text-center text-[13px] text-mist ring-1 ring-black/5">
              {pagine === "errore" ? t("rep.errPdf") : t("rep.generazione")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
