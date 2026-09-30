import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Intestazione } from "@/components/Intestazione";
import { CampoNumero } from "@/components/CampoNumero";
import { toast } from "sonner";
import { useT, useTitoloPagina } from "@/lib/i18n";
import { LINGUE, TRADUZIONI } from "@/lib/traduzioni";
import { esportaJson } from "@/lib/esportazione";
import { aggiornaValutazione, useAzienda, useValutazione } from "@/lib/archivio";
import {
  calcola,
  etichettaEsito,
  nuovoId,
  num,
  SOGLIE,
  type Componente,
  type Valutazione,
} from "@/lib/ppwr";

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
        content:
          "Bilancio di massa e attribuzione del grado di prestazione secondo Reg. UE 2025/40.",
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
  const { azienda } = useAzienda();
  const qc = useQueryClient();
  const [v, setV] = useState<Valutazione | null>(null);
  const [stato, setStato] = useState<
    "salvato" | "modificato" | "salvataggio" | "nuovoTentativo" | "errore"
  >("salvato");
  const [chiediNome, setChiediNome] = useState(false);
  const [bozzaNome, setBozzaNome] = useState("");
  const [tentativo, setTentativo] = useState(0);
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
    let annullato = false;
    // In caso di rete assente il salvataggio riprova da solo (subito, dopo 2 s e dopo 5 s).
    const ritardi = [0, 2000, 5000];
    const t = setTimeout(async () => {
      for (let i = 0; i < ritardi.length; i++) {
        if (annullato) return;
        if (ritardi[i]) {
          setStato("nuovoTentativo");
          await new Promise((r) => setTimeout(r, ritardi[i]));
          if (annullato) return;
        } else {
          setStato("salvataggio");
        }
        try {
          await aggiornaValutazione(v);
          if (annullato) return;
          qc.setQueryData(["valutazione", v.id], v);
          qc.invalidateQueries({ queryKey: ["valutazioni"] });
          setStato("salvato");
          return;
        } catch {
          /* riprova al giro successivo */
        }
      }
      if (!annullato) setStato("errore");
    }, 700);
    return () => {
      annullato = true;
      clearTimeout(t);
    };
  }, [v, qc, tentativo]);

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

  const esito = calcola(v.componenti);

  async function esportaFile() {
    if (!v) return;
    try {
      const nome = await esportaJson(v, azienda);
      if (nome) toast.success(t("json.esportato", { nome }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("json.errEsportazione"));
    }
  }

  function aggiorna(cid: string, campo: "nome" | "materiale", valore: string) {
    setV((prev) =>
      prev
        ? {
            ...prev,
            componenti: prev.componenti.map((c) => (c.id === cid ? { ...c, [campo]: valore } : c)),
          }
        : prev,
    );
  }

  function aggiornaNum(cid: string, campo: "peso" | "indice", valore: number) {
    setV((prev) =>
      prev
        ? {
            ...prev,
            componenti: prev.componenti.map((c) => (c.id === cid ? { ...c, [campo]: valore } : c)),
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
    "w-full rounded-md border border-line bg-paper px-2 py-1 outline-none transition-colors hover:border-mist/60 focus:border-signal focus:bg-white";
  const campo =
    "rounded-md border border-line bg-paper px-2 py-1 outline-none transition-colors hover:border-mist/60 focus:border-signal focus:bg-white";
  const etichetta = "block font-mono text-[10px] uppercase tracking-[0.12em] text-mist";

  const nomiGenerici = LINGUE.map((l) => TRADUZIONI[l]["val.nuova"].trim().toLowerCase());
  const titoloGenerico = (s: string) =>
    !s.trim() || nomiGenerici.includes(s.trim().toLowerCase());

  async function salvaOra(dati: Valutazione) {
    setStato("salvataggio");
    try {
      await aggiornaValutazione(dati);
      qc.setQueryData(["valutazione", dati.id], dati);
      qc.invalidateQueries({ queryKey: ["valutazioni"] });
      setStato("salvato");
      toast.success(t("ed.salvataggioOk"));
    } catch {
      setStato("errore");
      toast.error(t("ed.errSalvataggio"));
    }
  }

  function premiSalva() {
    if (!v) return;
    if (titoloGenerico(v.titolo)) {
      setBozzaNome("");
      setChiediNome(true);
      return;
    }
    void salvaOra(v);
  }

  function confermaNome() {
    if (!v) return;
    const nome = bozzaNome.trim();
    if (!nome || titoloGenerico(nome)) {
      toast.error(t("ed.nomeObbligatorio"));
      return;
    }
    const agg = { ...v, titolo: nome };
    setV(agg);
    setChiediNome(false);
    void salvaOra(agg);
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione
          azione={
            <>
              <button
                type="button"
                onClick={premiSalva}
                className="ml-2 inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-signal bg-signal/10 px-3 py-1.5 text-[13px] font-semibold text-signal hover:bg-signal/15"
              >
                <Check className="size-3.5" />
                {t("ed.salva")}
              </button>
              <button
                type="button"
                onClick={esportaFile}
                className="ml-2 rounded-lg border-[1.5px] border-signal bg-white px-3 py-1.5 text-[13px] font-medium hover:bg-paper"
              >
                {t("json.esporta")}
              </button>
              <Link
                to="/report/$id"
                params={{ id: v.id }}
                className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-signal bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
              >
                <span className="inline-block size-3 shrink-0 rounded-[2px] border border-white/70" />
                {t("ed.esporta")}
              </Link>
            </>
          }
        />

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div className="min-w-[320px] flex-1">
            <label className={etichetta} htmlFor="titolo-valutazione">
              {t("ed.etNome")}
            </label>
            <input
              id="titolo-valutazione"
              value={v.titolo}
              placeholder={t("ed.phNome")}
              onChange={(e) => setV({ ...v, titolo: e.target.value })}
              className={`mt-1 w-full ${campo} font-display text-[19px] font-semibold leading-tight`}
            />
          </div>
          <div>
            <label className={etichetta} htmlFor="revisione-valutazione">
              {t("ed.etRevisione")}
            </label>
            <input
              id="revisione-valutazione"
              value={v.revisione}
              onChange={(e) => setV({ ...v, revisione: e.target.value })}
              className={`mt-1 w-28 ${campo} font-mono text-[12px]`}
            />
          </div>
          <div>
            <label className={etichetta} htmlFor="data-valutazione">
              {t("ed.etData")}
            </label>
            <input
              id="data-valutazione"
              type="date"
              value={v.data}
              onChange={(e) => setV({ ...v, data: e.target.value })}
              className={`mt-1 ${campo} font-mono text-[12px]`}
            />
          </div>
          <span
            className={`pb-1.5 font-mono text-[11px] ${stato === "errore" ? "text-danger" : "text-mist"}`}
          >
            {stato === "salvato"
              ? t("ed.salvato")
              : stato === "errore"
                ? t("ed.errSalvataggio")
                : t("ed.salvataggio")}
          </span>
        </div>

        {chiediNome && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-5 ring-1 ring-black/10">
              <div className="font-display text-[16px] font-semibold">
                {t("ed.chiediNomeTitolo")}
              </div>
              <p className="mt-1 text-[12px] text-mist">{t("ed.chiediNomeTesto")}</p>
              <input
                autoFocus
                value={bozzaNome}
                placeholder={t("ed.phNome")}
                onChange={(e) => setBozzaNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confermaNome()}
                className="mt-3 w-full rounded-md border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-signal focus:bg-white"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChiediNome(false)}
                  className="rounded-lg border-[1.5px] border-signal px-3 py-1.5 text-[13px] font-medium hover:bg-paper"
                >
                  {t("ed.annulla")}
                </button>
                <button
                  type="button"
                  onClick={confermaNome}
                  className="rounded-lg bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
                >
                  {t("ed.confermaSalva")}
                </button>
              </div>
            </div>
          </div>
        )}


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
                      <CampoNumero
                        value={c.peso}
                        onChange={(n) => aggiornaNum(c.id, "peso", n)}
                        ariaLabel={t("ed.colPeso")}
                        className={`${input} text-right`}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <CampoNumero
                        value={c.indice}
                        max={100}
                        onChange={(n) => aggiornaNum(c.id, "indice", n)}
                        ariaLabel={t("ed.colPercRicic")}
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
                className="rounded-lg border-[1.5px] border-signal px-3 py-1.5 text-[12px] font-medium hover:bg-paper"
              >
                {t("ed.aggiungi")}
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-mist">{t("ed.notaNumeri")}</p>
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
                  {t("ed.gRiciclabili", {
                    m: num(esito.massaRiciclabile),
                    t: num(esito.pesoTotale),
                  })}
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
                    {t("ed.sogliaMin")} <span className="font-medium text-ink">≥ 70%</span>
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
                    <span className="text-mist">
                      {t("grado.label")} {s.grado}
                    </span>
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
