import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SelettoreLingua } from "@/components/SelettoreLingua";
import { useT } from "@/lib/i18n";
import { sospendiAccessoAutomatico } from "@/lib/devAuth";

export function Intestazione({ azione }: { azione?: React.ReactNode }) {
  const t = useT();
  const voce = "rounded-lg border-[1.5px] border-signal bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper";
  const attiva = { className: "rounded-lg border-[1.5px] border-signal bg-signal/10 px-3 py-1.5 text-[13px] font-semibold text-ink" };
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function esci() {
    // Impedisce all'accesso automatico di prova di rientrare subito dopo la disconnessione.
    sospendiAccessoAutomatico();
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="no-print flex flex-wrap items-center justify-between gap-3">
      <Link to="/valutazioni" className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-[9px] bg-ink font-display text-[15px] font-bold text-paper">
          R
        </div>
        <div>
          <div className="font-display text-[15px] font-semibold leading-none tracking-tight">
            {t("app.nome")}
          </div>
          <div className="font-mono text-[11px] text-mist">{t("app.sottotitolo")}</div>
        </div>
      </Link>
      <nav className="flex flex-wrap items-center gap-2 text-[13px]">
        <Link to="/valutazioni" className={voce} activeProps={attiva}>
          {t("nav.valutazioni")}
        </Link>
        <Link to="/impostazioni" className={voce} activeProps={attiva}>
          {t("nav.impostazioni")}
        </Link>
        <button type="button" onClick={esci} className={voce}>
          {t("nav.esci")}
        </button>
        <Link
          to="/guida"
          title={t("nav.guida")}
          aria-label={t("nav.guida")}
          className="grid size-8 place-items-center rounded-full border-[1.5px] border-signal bg-white font-display text-[14px] font-bold italic text-ink transition-colors hover:bg-paper"
          activeProps={{ className: "grid size-8 place-items-center rounded-full border-[1.5px] border-signal bg-signal/10 font-display text-[14px] font-bold italic text-ink" }}
        >
          i
        </Link>
        <SelettoreLingua />
        {azione}
      </nav>
    </header>
  );
}
