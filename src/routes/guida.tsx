import { createFileRoute } from "@tanstack/react-router";
import { Intestazione } from "@/components/Intestazione";
import { useLingua, useTitoloPagina } from "@/lib/i18n";
import { GUIDA } from "@/lib/guida";

export const Route = createFileRoute("/guida")({
  head: () => ({
    meta: [
      { title: "Guida — Riciclabilità PPWR" },
      {
        name: "description",
        content: "Guida all'uso: calcolo della riciclabilità, gradi PPWR, editor, report PDF.",
      },
    ],
  }),
  component: Guida,
});

function Guida() {
  const { lingua, t } = useLingua();
  useTitoloPagina("guida.titoloPagina");
  const sezioni = GUIDA[lingua];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione />
        <div className="mt-6 flex items-baseline gap-3">
          <h1 className="font-display text-[19px] font-semibold leading-tight">{t("guida.titolo")}</h1>
          <span className="font-mono text-[11px] text-mist">{t("guida.intro")}</span>
        </div>

        <div className="rise mt-5 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="h-fit rounded-xl bg-white p-4 ring-1 ring-black/5 lg:sticky lg:top-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
              {t("guida.sommario")}
            </div>
            <ul className="mt-2 space-y-1.5 text-[12px]">
              {sezioni.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-signal">
                    {s.titolo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            {sezioni.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-6 rounded-xl bg-white p-5 ring-1 ring-black/5"
              >
                <h2 className="font-display text-[15px] font-semibold">{s.titolo}</h2>
                {s.testo.map((p) => (
                  <p key={p} className="mt-2 text-[13px] leading-relaxed">
                    {p}
                  </p>
                ))}
                {s.punti && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed">
                    {s.punti.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <p className="text-[11px] leading-relaxed text-mist">{t("guida.avviso")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
