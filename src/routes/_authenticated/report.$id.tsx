import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Intestazione } from "@/components/Intestazione";
import { useAzienda, useValutazione } from "@/lib/archivio";
import { calcola, num, SOGLIE } from "@/lib/ppwr";

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
        content: "Documento di valutazione conforme al Regolamento UE 2025/40, pronto per la stampa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Report,
});

function Report() {
  const { id } = useParams({ from: "/_authenticated/report/$id" });
  const { azienda } = useAzienda();
  const { data: v, isLoading } = useValutazione(id);

  if (!v) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <div className="mx-auto max-w-[1180px] px-6 py-7">
          <Intestazione />
          <p className="mt-10 text-[13px] text-mist">{isLoading ? "Caricamento…" : "Valutazione non trovata."}</p>
        </div>
      </div>
    );
  }

  const e = calcola(v.componenti);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione
          azione={
            <button
              type="button"
              onClick={() => window.print()}
              className="ml-2 rounded-lg bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground ring-1 ring-signal/40"
            >
              Stampa / PDF
            </button>
          }
        />

        <div className="no-print mt-6 flex items-baseline gap-3">
          <h1 className="font-display text-[19px] font-semibold leading-tight">
            Anteprima report
          </h1>
          <Link
            to="/valutazione/$id"
            params={{ id: v.id }}
            className="font-mono text-[11px] text-mist hover:text-ink"
          >
            ← torna all&apos;editor
          </Link>
        </div>

        <article className="rise mx-auto mt-5 max-w-[820px] rounded-xl bg-white p-10 ring-1 ring-black/5">
          <header className="flex items-start justify-between gap-6 border-b border-line pb-5">
            <div>
              <div className="font-display text-[15px] font-semibold">
                {azienda.ragioneSociale || "Azienda non impostata"}
              </div>
              <div className="mt-1 font-mono text-[11px] leading-relaxed text-mist">
                {azienda.indirizzo && <div>{azienda.indirizzo}</div>}
                {azienda.partitaIva && <div>P.IVA {azienda.partitaIva}</div>}
                {azienda.referente && <div>Referente: {azienda.referente}</div>}
                {azienda.email && <div>{azienda.email}</div>}
              </div>
              {!azienda.ragioneSociale && (
                <Link
                  to="/impostazioni"
                  className="no-print mt-2 inline-block text-[11px] text-signal underline"
                >
                  Imposta i dati azienda
                </Link>
              )}
            </div>
            {azienda.logoDataUrl && (
              <img src={azienda.logoDataUrl} alt="Logo azienda" className="max-h-16 max-w-[180px]" />
            )}
          </header>

          <h2 className="mt-7 font-display text-[20px] font-semibold leading-snug">
            Valutazione della riciclabilità dell&apos;imballaggio
          </h2>
          <div className="mt-1 font-mono text-[11px] text-mist">
            {v.titolo} · {v.revisione} · {v.data}
          </div>

          <p className="mt-5 text-[13px] leading-relaxed">
            La presente relazione determina la quota di riciclabilità su base ponderale
            dell&apos;imballaggio in oggetto ai sensi del Regolamento (UE) 2025/40 (PPWR). La
            percentuale è calcolata come rapporto tra la massa dei componenti riciclabili e la massa
            totale dell&apos;imballaggio, secondo le classi di prestazione dell&apos;Allegato II,
            Tabella 3.
          </p>

          <h3 className="mt-7 font-display text-[14px] font-semibold">1. Bilancio di massa</h3>
          <table className="mt-3 w-full text-[12px]">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.12em] text-mist">
                <th className="py-2 font-medium">Componente</th>
                <th className="py-2 font-medium">Materiale</th>
                <th className="py-2 text-right font-medium">Peso (g)</th>
                <th className="py-2 text-right font-medium">Indice (%)</th>
                <th className="py-2 text-right font-medium">Massa ricic. (g)</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {v.componenti.map((c) => (
                <tr key={c.id} className="border-b border-line/60">
                  <td className="py-2 font-body">{c.nome}</td>
                  <td className="py-2">{c.materiale}</td>
                  <td className="py-2 text-right">{num(c.peso)}</td>
                  <td className="py-2 text-right">{num(c.indice, 1)}</td>
                  <td className="py-2 text-right">{num((c.peso * c.indice) / 100)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line font-medium">
                <td className="py-2.5 font-body text-mist">Totale imballaggio</td>
                <td />
                <td className="py-2.5 text-right font-mono tabular-nums">{num(e.pesoTotale)}</td>
                <td />
                <td className="py-2.5 text-right font-mono tabular-nums">
                  {num(e.massaRiciclabile)}
                </td>
              </tr>
            </tfoot>
          </table>

          <h3 className="mt-7 font-display text-[14px] font-semibold">2. Esito del calcolo</h3>
          <div className="mt-3 flex items-center gap-5 rounded-lg border border-line bg-paper px-5 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                Riciclabilità
              </div>
              <div
                className={`font-display text-[34px] font-bold leading-none ${
                  e.conforme ? "text-signal" : "text-danger"
                }`}
              >
                {num(e.percentuale)}%
              </div>
            </div>
            <div className="border-l border-line pl-5">
              <div className="text-[13px] font-medium">{e.etichetta}</div>
              <div className="text-[11px] text-mist">
                Stato di ammissibilità dal 2030: {e.stato}
              </div>
            </div>
          </div>

          <h3 className="mt-7 font-display text-[14px] font-semibold">
            3. Classi di prestazione (Allegato II, Tabella 3)
          </h3>
          <table className="mt-3 w-full text-[12px]">
            <tbody>
              {SOGLIE.map((s) => (
                <tr key={s.grado} className="border-b border-line/60">
                  <td className="py-2 font-medium">Grado {s.grado}</td>
                  <td className="py-2 font-mono">≥ {s.min}%</td>
                  <td className="py-2 text-mist">{s.stato}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 font-medium">Non conforme</td>
                <td className="py-2 font-mono">&lt; 70%</td>
                <td className="py-2 text-mist">Non ammesso</td>
              </tr>
            </tbody>
          </table>

          {v.note && (
            <>
              <h3 className="mt-7 font-display text-[14px] font-semibold">4. Note tecniche</h3>
              <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed">{v.note}</p>
            </>
          )}

          <footer className="mt-10 border-t border-line pt-4 font-mono text-[10px] text-mist">
            Documento generato per il fascicolo tecnico di cui all&apos;Allegato VII del Reg. (UE)
            2025/40 — {azienda.ragioneSociale || "azienda non impostata"}
          </footer>
        </article>
      </div>
    </div>
  );
}
