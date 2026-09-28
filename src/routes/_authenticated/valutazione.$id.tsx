import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Intestazione } from "@/components/Intestazione";
import { useT, useTitoloPagina } from "@/lib/i18n";
import { aggiornaValutazione, useValutazione } from "@/lib/archivio";
import { calcola, etichettaEsito, nuovoId, num, SOGLIE, type Componente, type Valutazione } from "@/lib/ppwr";

export const Route = createFileRoute("/_authenticated/valutazione/$id")({
  head: () => ({
    meta: [
      { title: "Editor valutazione — Riciclabilità PPWR" },
      {
        name: "description",
        content:
          "Inserisci i componenti dell'imballaggio con peso e indice di riciclabilità e ottieni percentuale e grado PPWR in tempo reale.",
      },
      { property: "og:title", content: "Editor valutazione — Riciclabilità PPWR" },
      {
        property: "og:description",
        content: "Bilancio di massa e attribuzione del grado di prestazione secondo Reg. UE 2025/40.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Editor,
});

function Editor() {
  const t = useT();
  useTitoloPagina("ed.titoloPagina");
  const { id } = useParams({ from: "/_authenticated/valutazione/$id" });
  const { data, isLoading } = useValutazione(id);
  const qc = useQueryClient();
  const [v, setV] = useState<Valutazione | null>(null);
  const [stato, setStato] = useState<"salvato" | "modificato" | "salvataggio" | "errore">("salvato");
  const primo = useRef(true);

  useEffect(() => {
    if (data && !v) setV(data);
  }, [data, v]);

  useEffect(() => {
    if (!v) return;
    if (primo.current) {
      primo.current = false;
      return;
    }
    setStato("modificato");
    const t = setTimeout(async () => {
      setStato("salvataggio");
      try {
        await aggiornaValutazione(v);
        qc.setQueryData(["valutazione", v.id], v);
        qc.invalidateQueries({ queryKey: ["valutazioni"] });
        setStato("salvato");
      } catch {
        setStato("errore");
      }
    }, 700);
    return () => clearTimeout(t);
  }, [v, qc]);

  if (!v) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <div className="mx-auto max-w-[1180px] px-6 py-7">
          <Intestazione />
          <p className="mt-10 text-[13px] text-mist">{isLoading ? t("comune.caricamento") : t("comune.nonTrovata")}</p>
        </div>
      </div>
    );
  }

  const esito = calcola(v.componenti);

  function aggiorna(cid: string, campo: keyof Componente, valore: string) {
    setV((prev) =>
      prev
        ? {
            ...prev,
            componenti: prev.componenti.map((c) =>
              c.id === cid
                ? {
                    ...c,
                    [campo]:
                      campo === "peso" || campo === "indice"
                        ? Number(valore.replace(",", ".")) || 0
                        : valore,
                  }
                : c,
            ),
          }
        : prev,
    );
  }

  function aggiungi() {
    setV((prev) =>
      prev
        ? {
            ...prev,
            componenti: [
              ...prev.componenti,
              { id: nuovoId(), nome: t("ed.nuovoComponente"), materiale: "", peso: 0, indice: 100 },
            ],
          }
        : prev,
    );
  }

  function rimuovi(cid: string) {
    setV((prev) =>
      prev ? { ...prev, componenti: prev.componenti.filter((c) => c.id !== cid) } : prev,
    );
  }

  const input =
    "w-full bg-transparent outline-none focus:bg-signal/5 rounded px-1 py-0.5 -mx-1";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione
          azione={
            <Link
              to="/report/$id"
              params={{ id: v.id }}
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground ring-1 ring-signal/40"
            >
              <span className="inline-block size-3 shrink-0 rounded-[2px] border border-white/70" />
              {t("ed.esporta")}
            </Link>
          }
        />

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <input
            value={v.titolo}
            onChange={(e) => setV({ ...v, titolo: e.target.value })}
            className="min-w-[320px] rounded px-1 py-0.5 font-display text-[19px] font-semibold leading-tight outline-none focus:bg-signal/5"
          />
          <input
            value={v.revisione}
            onChange={(e) => setV({ ...v, revisione: e.target.value })}
            className="w-24 rounded px-1 font-mono text-[11px] text-mist outline-none focus:bg-signal/5"
          />
          <span className={`font-mono text-[11px] ${stato === "errore" ? "text-danger" : "text-mist"}`}>
            {stato === "salvato" ? t("ed.salvato") : stato === "errore" ? t("ed.errSalvataggio") : t("ed.salvataggio")}
          </span>
          <input
            type="date"
            value={v.data}
            onChange={(e) => setV({ ...v, data: e.target.value })}
            className="rounded px-1 font-mono text-[11px] text-mist outline-none focus:bg-signal/5"
          />
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_352px]">
          <div className="rise overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="text-[13px] font-medium">{t("ed.componenti")}</div>
              <div className="font-mono text-[11px] text-mist">
                {t("ed.righe", { n: v.componenti.length, peso: num(esito.pesoTotale) })}
              </div>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.12em] text-mist">
                  <th className="px-4 py-2.5 font-medium">{t("ed.colComponente")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("ed.colMateriale")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("ed.colPeso")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("ed.colPercRicic")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("ed.colMassaRicic")}</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {v.componenti.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-signal/5">
                    <td className="px-4 py-2.5 font-body">
                      <input
                        value={c.nome}
                        onChange={(e) => aggiorna(c.id, "nome", e.target.value)}
                        className={input}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        value={c.materiale}
                        onChange={(e) => aggiorna(c.id, "materiale", e.target.value)}
                        className={input}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        value={c.peso}
                        onChange={(e) => aggiorna(c.id, "peso", e.target.value)}
                        className={`${input} text-right`}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        value={c.indice}
                        onChange={(e) => aggiorna(c.id, "indice", e.target.value)}
                        className={`${input} text-right`}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right text-signal">
                      {num((c.peso * c.indice) / 100)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => rimuovi(c.id)}
                        className="font-body text-[11px] text-mist hover:text-danger"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line font-medium">
                  <td className="px-4 py-3 font-body text-[12px] text-mist">{t("ed.totale")}</td>
                  <td />
                  <td className="px-3 py-3 text-right font-mono tabular-nums">
                    {num(esito.pesoTotale)}
                  </td>
                  <td />
                  <td className="px-3 py-3 text-right font-mono tabular-nums">
                    {num(esito.massaRiciclabile)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
            <div className="border-t border-line px-4 py-3">
              <button
                type="button"
                onClick={aggiungi}
                className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium hover:bg-paper"
              >
                {t("ed.aggiungi")}
              </button>
            </div>
          </div>

          <aside className="rise space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="absolute -right-10 -top-8 size-40 rounded-[50%] bg-signal/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-6 size-32 rounded-[50%] bg-signal/5 blur-2xl" />
              <div className="relative">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
                  {t("ed.calcolata")}
                </div>
                <div className="mt-1 flex items-end gap-2">
                  <span
                    className={`font-display text-[52px] font-bold leading-none tracking-tight ${
                      esito.conforme ? "text-signal" : "text-danger"
                    }`}
                  >
                    {num(esito.percentuale)}
                  </span>
                  <span className="pb-1 font-display text-[24px] font-semibold leading-none text-mist">
                    %
                  </span>
                </div>
                <div className="mt-1.5 text-[12px] text-mist">
                  {t("ed.gRiciclabili", { m: num(esito.massaRiciclabile), t: num(esito.pesoTotale) })}
                </div>

                <div className="mt-5">
                  <div className="relative h-2 overflow-hidden rounded-full bg-line">
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                        esito.conforme ? "bg-signal" : "bg-danger"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, esito.percentuale))}%` }}
                    />
                  </div>
                  <div className="relative mt-2 h-3 font-mono text-[10px] text-mist">
                    <span className="absolute left-[70%] -translate-x-1/2">70%</span>
                    <span className="absolute left-[80%] -translate-x-1/2">80%</span>
                    <span className="absolute left-[95%] -translate-x-1/2">95%</span>
                  </div>
                  <div className="mt-1 text-[11px] text-mist">
                    {t("ed.sogliaMin")}{" "}
                    <span className="font-medium text-ink">≥ 70%</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <div
                    className={`grid size-11 place-items-center rounded-lg font-display text-[18px] font-bold ${
                      esito.conforme ? "bg-signal/10 text-signal" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {esito.grado}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{etichettaEsito(esito, t)}</div>
                    <div className="text-[11px] text-mist">{t(esito.stato)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
                {t("ed.soglie")}
              </div>
              <div className="mt-3 space-y-2 text-[12px]">
                {SOGLIE.map((s) => (
                  <div key={s.grado} className="flex justify-between font-mono tabular-nums">
                    <span className="text-mist">{t("grado.label")} {s.grado}</span>
                    <span className={esito.grado === s.grado ? "text-signal" : ""}>≥ {s.min}%</span>
                  </div>
                ))}
                <div className="flex justify-between font-mono tabular-nums">
                  <span className="text-mist">{t("esito.nonConforme")}</span>
                  <span className={esito.conforme ? "" : "text-danger"}>&lt; 70%</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
                {t("ed.note")}
              </div>
              <textarea
                value={v.note}
                onChange={(e) => setV({ ...v, note: e.target.value })}
                rows={4}
                placeholder={t("ed.notePlaceholder")}
                className="mt-2 w-full resize-none rounded-lg border border-line bg-paper px-3 py-2 text-[12px] outline-none focus:border-signal"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
