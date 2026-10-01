// ======================================================================
// Nome File: Intestazione.tsx
// Percorso: src/components/Intestazione.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 20:56
// ======================================================================

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

  // =====================================================================
  // FN001[ChiudiApplicazione]: sospende l'auto-login, svuota la cache, esegue il logout
  // e tenta di chiudere la scheda; se il browser blocca window.close() porta a /auth.
  // =====================================================================
  async function FN001_ChiudiApplicazione() {
    // Impedisce all'accesso automatico di prova di riattivarsi.
    sospendiAccessoAutomatico();
    await qc.cancelQueries();
    qc.clear();
    try {
      await supabase.auth.signOut();
    } catch (errore) {
      console.error("ERR001: Logout non riuscito durante la chiusura dell'applicazione", errore);
    }
    // Tentativo di chiusura della scheda (i browser la consentono solo in certi casi).
    window.close();
    // Fallback: se la scheda resta aperta, si torna alla schermata di accesso.
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
        {/* BT01_ChiudiApplicazione */}
        <button type="button" onClick={FN001_ChiudiApplicazione} className={voce}>
          {t("nav.chiudiApp")}
        </button>
        <SelettoreLingua />
        {azione}
      </nav>
    </header>
  );
}
