import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SelettoreLingua } from "@/components/SelettoreLingua";
import { useT } from "@/lib/i18n";

export function Intestazione({ azione }: { azione?: React.ReactNode }) {
  const t = useT();
  const voce = "px-3 py-1.5 text-mist hover:text-ink transition-colors rounded-md";
  const attiva = { className: "px-3 py-1.5 rounded-md bg-ink/5 font-medium text-ink" };
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function esci() {
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
      <nav className="flex flex-wrap items-center gap-1 text-[13px]">
        <Link to="/valutazioni" className={voce} activeProps={attiva}>
          {t("nav.valutazioni")}
        </Link>
        <Link to="/impostazioni" className={voce} activeProps={attiva}>
          {t("nav.impostazioni")}
        </Link>
        <button type="button" onClick={esci} className={voce}>
          {t("nav.esci")}
        </button>
        <SelettoreLingua />
        {azione}
      </nav>
    </header>
  );
}
