import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { SOGLIE } from "@/lib/ppwr";
import { SelettoreLingua } from "@/components/SelettoreLingua";
import { useT, useTitoloPagina } from "@/lib/i18n";
import { AUTO_LOGIN, accessoSospeso } from "@/lib/devAuth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (AUTO_LOGIN && !accessoSospeso()) throw redirect({ to: "/valutazioni" });
  },
  head: () => ({
    meta: [
      { title: "Riciclabilità PPWR — Calcolo grado di riciclabilità imballaggi" },
      {
        name: "description",
        content:
          "Calcola la percentuale di riciclabilità degli imballaggi e il grado PPWR (Reg. UE 2025/40). Report tecnici stampabili con logo aziendale.",
      },
      { property: "og:title", content: "Riciclabilità PPWR — Calcolo grado imballaggi" },
      {
        property: "og:description",
        content: "Valutazioni di riciclabilità secondo il Regolamento UE 2025/40, salvate online.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const t = useT();
  useTitoloPagina("landing.titoloPagina");
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[9px] bg-ink font-display text-[15px] font-bold text-paper">
              R
            </div>
            <div className="font-display text-[15px] font-semibold">{t("app.nome")}</div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/guida"
              title={t("nav.guida")}
              aria-label={t("nav.guida")}
              className="grid size-8 place-items-center rounded-full border-[1.5px] border-signal bg-white font-display text-[14px] font-bold italic text-ink hover:bg-paper"
            >
              i
            </Link>
            <SelettoreLingua />
            <Link
              to="/valutazioni"
              className="rounded-lg bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
            >
              {t("landing.accedi")}
            </Link>
          </div>
        </header>
        <section className="rise mt-20 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
            {t("landing.kicker")}
          </div>
          <h1 className="mt-3 font-display text-[40px] font-bold leading-[1.05] tracking-tight">
            {t("landing.titolo")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-mist">{t("landing.testo")}</p>
          <Link
            to="/valutazioni"
            className="mt-7 inline-block rounded-lg bg-signal px-5 py-2.5 text-[14px] font-medium text-primary-foreground"
          >
            {t("landing.inizia")}
          </Link>
        </section>
        <section className="mt-16 grid gap-3 sm:grid-cols-4">
          {SOGLIE.map((s) => (
            <div key={s.grado} className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="font-display text-[28px] font-bold text-signal">{s.grado}</div>
              <div className="font-mono text-[12px]">≥ {s.min}%</div>
              <div className="mt-1 text-[12px] text-mist">{t(s.nome)}</div>
            </div>
          ))}
          <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
            <div className="font-display text-[28px] font-bold text-danger">—</div>
            <div className="font-mono text-[12px]">&lt; 70%</div>
            <div className="mt-1 text-[12px] text-mist">{t("esito.nonConforme")}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
