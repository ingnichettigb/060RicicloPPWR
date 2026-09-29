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
  const [anteprima, setAnteprima] = useState<{ url: string } | { errore: true } | null>(null);

  // L'anteprima è il PDF vero, generato con lo stesso codice del download.
  useEffect(() => {
    if (!v) return;
    let annullato = false;
    let url = "";
    setAnteprima(null);
    (async () => {
      try {
        const { generaPdf } = await import("@/lib/pdfReport");
        const blob = await generaPdf({ t, azienda, v, e: calcola(v.componenti) });
        if (annullato) return;
        url = URL.createObjectURL(blob);
        setAnteprima({ url });
      } catch {
        if (!annullato) setAnteprima({ errore: true });
      }
    })();
    return () => {
      annullato = true;
      if (url) URL.revokeObjectURL(url);
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
                const { scaricaPdf } = await import("@/lib/pdfReport");
                await scaricaPdf({ t, azienda, v, e: calcola(v.componenti) });
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
          {anteprima && "url" in anteprima && (
            <a
              href={anteprima.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-signal underline"
            >
              {t("rep.apriPdf")}
            </a>
          )}
        </div>

        <div className="mx-auto mt-5 max-w-[900px] overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          {anteprima && "url" in anteprima ? (
            <iframe
              title={t("rep.anteprima")}
              src={`${anteprima.url}#view=FitH`}
              className="block h-[82vh] min-h-[560px] w-full border-0"
            />
          ) : (
            <p className="grid h-[40vh] place-items-center px-6 text-center text-[13px] text-mist">
              {anteprima ? t("rep.errPdf") : t("rep.generazione")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
