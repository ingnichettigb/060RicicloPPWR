import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Intestazione } from "@/components/Intestazione";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Download, FileText, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT, useTitoloPagina } from "@/lib/i18n";
import { aziendeDiverse, esportaJson, leggiPacchetto } from "@/lib/esportazione";
import {
  creaValutazione,
  eliminaValutazione,
  salvaAzienda,
  useAzienda,
  useRicaricaValutazioni,
  useValutazioni,
} from "@/lib/archivio";
import type { Valutazione } from "@/lib/ppwr";
import { calcola, nuovoId, num, valutazioneVuota } from "@/lib/ppwr";
import { useExportQuota } from "@/moduli/accesso-controllato/esportazione/useExportQuota";
import { FN060_ExportCountBadge } from "@/moduli/accesso-controllato/esportazione/ExportCountBadge";

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
        content: "Calcola la percentuale di riciclabilità in massa dei tuoi imballaggi e attribuisci il grado PPWR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Elenco,
});

const azioneRiga =
  "inline-grid size-8 place-items-center rounded-lg border-[1.5px] border-signal bg-white text-mist transition-colors hover:bg-ink/5 hover:text-ink";

function Elenco() {
  const t = useT();
  useTitoloPagina("val.titoloPagina");
  const { valutazioni, pronto } = useValutazioni();
  const navigate = useNavigate();
  const ricarica = useRicaricaValutazioni();
  const qc = useQueryClient();
  const { azienda, pronto: aziendaPronta } = useAzienda();
  const inputFile = useRef<HTMLInputElement>(null);

  // Stato per la riga selezionata (singola selezione)
  const [selezionataId, setSelezionataId] = useState<string | null>(null);
  const quota = useExportQuota();

  function toggleSelezione(id: string) {
    setSelezionataId((prev) => (prev === id ? null : id));
  }

  async function stampaPdfSelezionata() {
    if (!selezionataId) {
      toast.info("Seleziona prima una valutazione con la spunta a sinistra.");
      return;
    }
    const v = valutazioni.find((item) => item.id === selezionataId);
    if (!v) return;

    if (!(await quota.consume())) return;
    try {
      const { scaricaPdf } = await import("@/lib/pdfReport");
      await scaricaPdf({ t, azienda, v, e: calcola(v.componenti) });
      toast.success(t("rep.scaricato") || "Report scaricato con successo");
    } catch (err) {
      console.error("Download PDF non riuscito", err);
      toast.error(t("rep.errScarica") || "Errore durante il download del PDF");
    }
  }

  async function esporta(v: Valutazione) {
    try {
      const nome = await esportaJson(v, azienda);
      if (nome) toast.success(t("json.esportato", { nome }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("json.errEsportazione"));
    }
  }

  async function importa(file: File | undefined) {
    if (inputFile.current) inputFile.current.value = "";
    if (!file) return;
    try {
      const { valutazione, azienda: daFile } = await leggiPacchetto(file);
      const id = await creaValutazione(valutazione);

      if (daFile && aziendeDiverse(daFile, azienda)) {
        if (confirm(t("json.chiediAzienda", { nome: daFile.ragioneSociale || "—" }))) {
          await salvaAzienda(daFile);
          await qc.invalidateQueries({ queryKey: ["azienda"] });
          toast.success(t("json.aziendaAggiornata"));
        }
      }

      await ricarica();
      toast.success(t("json.importato", { titolo: valutazione.titolo }));
      navigate({ to: "/valutazione/$id", params: { id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("json.errImportazione"));
    }
  }

  async function crea() {
    try {
      const id = await creaValutazione(valutazioneVuota(t));
      await ricarica();
      navigate({ to: "/valutazione/$id", params: { id } });
    } catch (e) {
      alert(e instanceof Error ? e.message : t("val.errCrea"));
    }
  }

  async function duplica(v: Valutazione) {
    try {
      await creaValutazione({
        titolo: t("val.copia", { titolo: v.titolo }),
        revisione: v.revisione,
        data: new Date().toISOString().slice(0, 10),
        note: v.note,
        componenti: v.componenti.map((c) => ({ ...c, id: nuovoId() })),
      });
      await ricarica();
    } catch (e) {
      alert(e instanceof Error ? e.message : t("val.errDuplica"));
    }
  }

  async function elimina(v: Valutazione) {
    if (!confirm(t("val.confermaElimina", { titolo: v.titolo }))) return;
    if (selezionataId === v.id) setSelezionataId(null);
    await eliminaValutazione(v.id);
    await ricarica();
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        {/* Modale di avviso crediti PDF esauriti */}
        {quota.dialog}

        <Intestazione
          azione={
            <>
              <input
                ref={inputFile}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => importa(e.target.files?.[0])}
              />

              {/* Pulsante Stampa PDF con badge conteggio residui */}
              <button
                type="button"
                disabled={!aziendaPronta || !selezionataId}
                onClick={stampaPdfSelezionata}
                title={selezionataId ? t("rep.stampa") : "Seleziona una valutazione con la spunta per stampare il PDF"}
                className={`relative ml-2 inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-signal px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  selezionataId
                    ? "bg-signal text-primary-foreground shadow-sm hover:brightness-105"
                    : "cursor-not-allowed bg-white text-mist opacity-50"
                }`}
              >
                <FN060_ExportCountBadge count={quota.remaining} />
                <Printer className="size-3.5" />
                {t("rep.stampa")}
              </button>

              <button
                type="button"
                disabled={!aziendaPronta}
                onClick={() => inputFile.current?.click()}
                className="ml-2 rounded-lg border-[1.5px] border-signal bg-white px-3 py-1.5 text-[13px] font-medium hover:bg-paper disabled:opacity-60"
              >
                {t("json.importa")}
              </button>

              <button
                type="button"
                onClick={crea}
                className="rounded-lg border-[1.5px] border-signal bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
              >
                {t("val.nuova")}
              </button>
            </>
          }
        />

        <div className="mt-6 flex items-baseline gap-3">
          <h1 className="font-display text-[19px] font-semibold leading-tight">{t("val.archivio")}</h1>
          <span className="font-mono text-[11px] text-mist">{t("val.documenti", { n: valutazioni.length })}</span>
        </div>

        <div className="rise mt-5 overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          {pronto && valutazioni.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <div className="text-[13px] font-medium">{t("val.vuotoTitolo")}</div>
              <p className="mx-auto mt-2 max-w-sm text-[12px] text-mist">{t("val.vuotoTesto")}</p>
              <button
                type="button"
                onClick={crea}
                className="mt-5 rounded-lg bg-signal px-4 py-2 text-[13px] font-medium text-primary-foreground"
              >
                {t("val.nuova")}
              </button>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.12em] text-mist">
                  {/* Nuova colonna per la spunta */}
                  <th className="w-10 px-3 py-2.5 text-center font-medium" />
                  <th className="px-4 py-2.5 font-medium">{t("val.colValutazione")}</th>
                  <th className="px-3 py-2.5 font-medium">{t("val.colRevisione")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("val.colMassa")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("val.colRicic")}</th>
                  <th className="px-3 py-2.5 text-center font-medium">{t("val.colGrado")}</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {valutazioni.map((v) => {
                  const e = calcola(v.componenti);
                  const selezionata = v.id === selezionataId;
                  return (
                    <tr
                      key={v.id}
                      className={`border-b border-line/60 transition-colors ${
                        selezionata ? "bg-signal/10 ring-1 ring-inset ring-signal/30" : "hover:bg-signal/5"
                      }`}
                    >
                      {/* Quadratino spunta singola */}
                      <td className="w-10 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selezionata}
                          onChange={() => toggleSelezione(v.id)}
                          aria-label={`Seleziona ${v.titolo}`}
                          className="size-4 cursor-pointer rounded border-[1.5px] border-signal accent-[#005a36] focus:ring-signal"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <Link to="/valutazione/$id" params={{ id: v.id }} className="font-medium hover:text-signal">
                          {v.titolo}
                        </Link>
                        <div className="font-mono text-[11px] text-mist">{v.data}</div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] text-mist">{v.revisione}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">{num(e.pesoTotale)}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">{num(e.percentuale)}%</td>
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
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => esporta(v)}
                            title={t("json.esporta")}
                            aria-label={t("json.esporta")}
                            className={azioneRiga}
                          >
                            <Download className="size-4" />
                          </button>
                          <Link
                            to="/report/$id"
                            params={{ id: v.id }}
                            title={t("val.report")}
                            aria-label={t("val.report")}
                            className={azioneRiga}
                          >
                            <FileText className="size-4" />
                          </Link>
                          <Link
                            to="/valutazione/$id"
                            params={{ id: v.id }}
                            title={t("val.modifica")}
                            aria-label={t("val.modifica")}
                            className={azioneRiga}
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => duplica(v)}
                            title={t("val.duplica")}
                            aria-label={t("val.duplica")}
                            className={azioneRiga}
                          >
                            <Copy className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => elimina(v)}
                            title={t("val.elimina")}
                            aria-label={t("val.elimina")}
                            className={`${azioneRiga} hover:!bg-danger/10 hover:!text-danger`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
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
