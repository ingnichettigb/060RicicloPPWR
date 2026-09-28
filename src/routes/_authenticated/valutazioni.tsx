import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Intestazione } from "@/components/Intestazione";
import {
  creaValutazione,
  eliminaValutazione,
  useRicaricaValutazioni,
  useValutazioni,
} from "@/lib/archivio";
import type { Valutazione } from "@/lib/ppwr";
import { calcola, nuovoId, num, valutazioneVuota } from "@/lib/ppwr";

export const Route = createFileRoute("/_authenticated/valutazioni")({
  head: () => ({
    meta: [
      { title: "Valutazioni di riciclabilità — Riciclabilità PPWR" },
      {
        name: "description",
        content:
          "Elenco delle valutazioni di riciclabilità degli imballaggi calcolate secondo il Regolamento UE 2025/40 (PPWR).",
      },
      { property: "og:title", content: "Valutazioni di riciclabilità — Riciclabilità PPWR" },
      {
        property: "og:description",
        content:
          "Calcola la percentuale di riciclabilità in massa dei tuoi imballaggi e attribuisci il grado PPWR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Elenco,
});

function Elenco() {
  const { valutazioni, pronto } = useValutazioni();
  const navigate = useNavigate();
  const ricarica = useRicaricaValutazioni();

  async function crea() {
    try {
      const id = await creaValutazione(valutazioneVuota());
      await ricarica();
      navigate({ to: "/valutazione/$id", params: { id } });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Creazione non riuscita");
    }
  }

  async function duplica(v: Valutazione) {
    try {
      await creaValutazione({
        titolo: `${v.titolo} (copia)`,
        revisione: v.revisione,
        data: new Date().toISOString().slice(0, 10),
        note: v.note,
        componenti: v.componenti.map((c) => ({ ...c, id: nuovoId() })),
      });
      await ricarica();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Duplicazione non riuscita");
    }
  }

  async function elimina(v: Valutazione) {
    if (!confirm(`Eliminare "${v.titolo}"?`)) return;
    await eliminaValutazione(v.id);
    await ricarica();
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione
          azione={
            <button
              type="button"
              onClick={crea}
              className="ml-2 rounded-lg bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground ring-1 ring-signal/40"
            >
              Nuova valutazione
            </button>
          }
        />

        <div className="mt-6 flex items-baseline gap-3">
          <h1 className="font-display text-[19px] font-semibold leading-tight">
            Archivio valutazioni
          </h1>
          <span className="font-mono text-[11px] text-mist">
            {valutazioni.length} documenti · sincronizzati online
          </span>
        </div>

        <div className="rise mt-5 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          {pronto && valutazioni.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <div className="text-[13px] font-medium">Nessuna valutazione presente</div>
              <p className="mx-auto mt-2 max-w-sm text-[12px] text-mist">
                Crea la prima valutazione: inserisci i componenti dell&apos;imballaggio con peso e
                indice di riciclabilità, il grado PPWR viene calcolato automaticamente.
              </p>
              <button
                type="button"
                onClick={crea}
                className="mt-5 rounded-lg bg-signal px-4 py-2 text-[13px] font-medium text-primary-foreground"
              >
                Nuova valutazione
              </button>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.12em] text-mist">
                  <th className="px-4 py-2.5 font-medium">Valutazione</th>
                  <th className="px-3 py-2.5 font-medium">Revisione</th>
                  <th className="px-3 py-2.5 text-right font-medium">Massa (g)</th>
                  <th className="px-3 py-2.5 text-right font-medium">Riciclabilità</th>
                  <th className="px-3 py-2.5 text-center font-medium">Grado</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {valutazioni.map((v) => {
                  const e = calcola(v.componenti);
                  return (
                    <tr key={v.id} className="border-b border-line/60 transition-colors hover:bg-signal/5">
                      <td className="px-4 py-3">
                        <Link
                          to="/valutazione/$id"
                          params={{ id: v.id }}
                          className="font-medium hover:text-signal"
                        >
                          {v.titolo}
                        </Link>
                        <div className="font-mono text-[11px] text-mist">{v.data}</div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] text-mist">{v.revisione}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {num(e.pesoTotale)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">
                        {num(e.percentuale)}%
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-grid size-7 place-items-center rounded-md font-display text-[13px] font-bold ${
                            e.conforme ? "bg-signal/10 text-signal" : "bg-danger/10 text-danger"
                          }`}
                        >
                          {e.grado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/report/$id"
                          params={{ id: v.id }}
                          className="mr-3 text-[12px] text-mist hover:text-ink"
                        >
                          Report
                        </Link>
                        <Link
                          to="/valutazione/$id"
                          params={{ id: v.id }}
                          className="mr-3 text-[12px] text-mist hover:text-ink"
                        >
                          Modifica
                        </Link>
                        <button
                          type="button"
                          onClick={() => duplica(v)}
                          className="mr-3 text-[12px] text-mist hover:text-ink"
                        >
                          Duplica
                        </button>
                        <button
                          type="button"
                          onClick={() => elimina(v)}
                          className="text-[12px] text-mist hover:text-danger"
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
