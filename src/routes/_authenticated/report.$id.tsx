import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Intestazione } from "@/components/Intestazione";
import { useT, useTitoloPagina } from "@/lib/i18n";
import { useAzienda, useValutazione } from "@/lib/archivio";
import { calcola, etichettaEsito, num, SOGLIE } from "@/lib/ppwr";

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
  const t = useT();
  useTitoloPagina("rep.titoloPagina");
  const { id } = useParams({ from: "/_authenticated/report/$id" });
  const { azienda } = useAzienda();
  const { data: v, isLoading } = useValutazione(id);

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

  const e = calcola(v.componenti);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione
          azione={
            <button
              type="button"
              onClick={() => window.print()}
              className="ml-2 rounded-lg border-[1.5px] border-signal bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
            >
              {t("rep.stampa")}
            </button>
          }
        />

        <div className="no-print mt-6 flex items-baseline gap-3">
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

        <article className="rise mx-auto mt-5 max-w-[820px] rounded-xl bg-white p-10 ring-1 ring-black/5">
          <header className="flex items-start justify-between gap-6 border-b border-line pb-5">
            <div>
              <div className="font-display text-[15px] font-semibold">
                {azienda.ragioneSociale || t("rep.aziendaNonImpostata")}
              </div>
              <div className="mt-1 font-mono text-[11px] leading-relaxed text-mist">
                {azienda.indirizzo && <div>{azienda.indirizzo}</div>}
                {azienda.partitaIva && <div>{t("rep.piva", { v: azienda.partitaIva })}</div>}
                {azienda.referente && <div>{t("rep.referente", { v: azienda.referente })}</div>}
                {azienda.email && <div>{azienda.email}</div>}
              </div>
              {!azienda.ragioneSociale && (
                <Link
                  to="/impostazioni"
                  className="no-print mt-2 inline-block text-[11px] text-signal underline"
                >
                  {t("rep.impostaDati")}
                </Link>
              )}
            </div>
            {azienda.logoDataUrl && (
              <img
                src={azienda.logoDataUrl}
                alt={t("comune.logoAlt")}
                className="max-h-16 max-w-[180px]"
              />
            )}
          </header>

          <h2 className="mt-7 font-display text-[20px] font-semibold leading-snug">
            {t("rep.titolo")}
          </h2>
          <div className="mt-1 font-mono text-[11px] text-mist">
            {v.titolo} · {v.revisione} · {v.data}
          </div>

          <p className="mt-5 text-[13px] leading-relaxed">{t("rep.intro")}</p>

          <h3 className="mt-7 font-display text-[14px] font-semibold">{t("rep.s1")}</h3>
          <table className="mt-3 w-full text-[12px]">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.12em] text-mist">
                <th className="py-2 font-medium">{t("ed.colComponente")}</th>
                <th className="py-2 font-medium">{t("ed.colMateriale")}</th>
                <th className="py-2 text-right font-medium">{t("ed.colPeso")}</th>
                <th className="py-2 text-right font-medium">{t("rep.colIndice")}</th>
                <th className="py-2 text-right font-medium">{t("ed.colMassaRicic")}</th>
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
                <td className="py-2.5 font-body text-mist">{t("rep.totaleImballaggio")}</td>
                <td />
                <td className="py-2.5 text-right font-mono tabular-nums">{num(e.pesoTotale)}</td>
                <td />
                <td className="py-2.5 text-right font-mono tabular-nums">
                  {num(e.massaRiciclabile)}
                </td>
              </tr>
            </tfoot>
          </table>

          <h3 className="mt-7 font-display text-[14px] font-semibold">{t("rep.s2")}</h3>
          <div className="mt-3 flex items-center gap-5 rounded-lg border border-line bg-paper px-5 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                {t("rep.ricic")}
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
              <div className="text-[13px] font-medium">{etichettaEsito(e, t)}</div>
              <div className="text-[11px] text-mist">
                {t("rep.statoAmmissibilita", { stato: t(e.stato) })}
              </div>
            </div>
          </div>

          <h3 className="mt-7 font-display text-[14px] font-semibold">{t("rep.s3")}</h3>
          <table className="mt-3 w-full text-[12px]">
            <tbody>
              {SOGLIE.map((s) => (
                <tr key={s.grado} className="border-b border-line/60">
                  <td className="py-2 font-medium">
                    {t("grado.label")} {s.grado}
                  </td>
                  <td className="py-2 font-mono">≥ {s.min}%</td>
                  <td className="py-2 text-mist">{t(s.stato)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 font-medium">{t("esito.nonConforme")}</td>
                <td className="py-2 font-mono">&lt; 70%</td>
                <td className="py-2 text-mist">{t("stato.nonAmmesso")}</td>
              </tr>
            </tbody>
          </table>

          {v.note && (
            <>
              <h3 className="mt-7 font-display text-[14px] font-semibold">{t("rep.s4")}</h3>
              <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed">{v.note}</p>
            </>
          )}

          <footer className="mt-10 border-t border-line pt-4 font-mono text-[10px] text-mist">
            {t("rep.footer", {
              azienda: azienda.ragioneSociale || t("rep.aziendaNonImpostataMin"),
            })}
          </footer>
        </article>
      </div>
    </div>
  );
}
