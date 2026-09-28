import { createFileRoute, Link } from "@tanstack/react-router";
import { SOGLIE } from "@/lib/ppwr";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Riciclabilità PPWR — Calcolo grado di riciclabilità imballaggi" },
      {
        name: "description",
        content:
          "Calcola la percentuale di riciclabilità degli imballaggi e il grado PPWR (Reg. UE 2025/40). Report tecnici stampabili con logo aziendale.",
      },
      { property: "og:title", content: "Riciclabilità PPWR — Calcolo grado imballaggi" },
      { property: "og:description", content: "Valutazioni di riciclabilità secondo il Regolamento UE 2025/40, salvate online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[9px] bg-ink font-display text-[15px] font-bold text-paper">R</div>
            <div className="font-display text-[15px] font-semibold">Riciclabilità PPWR</div>
          </div>
          <Link to="/valutazioni" className="rounded-lg bg-signal px-3 py-1.5 text-[13px] font-medium text-primary-foreground">
            Accedi all&apos;app
          </Link>
        </header>
        <section className="rise mt-20 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">Reg. (UE) 2025/40 · Allegato II</div>
          <h1 className="mt-3 font-display text-[40px] font-bold leading-[1.05] tracking-tight">
            Riciclabilità degli imballaggi, calcolata e documentata.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-mist">
            Componi l&apos;imballaggio per componenti, ottieni la percentuale in massa e il grado PPWR in tempo
            reale, ed esporta un report tecnico intestato alla tua azienda. Tutto salvato online e
            sincronizzato tra i tuoi dispositivi.
          </p>
          <Link to="/valutazioni" className="mt-7 inline-block rounded-lg bg-signal px-5 py-2.5 text-[14px] font-medium text-primary-foreground">
            Inizia una valutazione
          </Link>
        </section>
        <section className="mt-16 grid gap-3 sm:grid-cols-4">
          {SOGLIE.map((s) => (
            <div key={s.grado} className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="font-display text-[28px] font-bold text-signal">{s.grado}</div>
              <div className="font-mono text-[12px]">≥ {s.min}%</div>
              <div className="mt-1 text-[12px] text-mist">{s.etichetta.split("— ")[1]}</div>
            </div>
          ))}
          <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
            <div className="font-display text-[28px] font-bold text-danger">—</div>
            <div className="font-mono text-[12px]">&lt; 70%</div>
            <div className="mt-1 text-[12px] text-mist">Non conforme</div>
          </div>
        </section>
      </div>
    </div>
  );
}
