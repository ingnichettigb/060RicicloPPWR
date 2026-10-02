// ======================================================================
// Nome File: Intestazione.tsx
// Percorso: src/components/Intestazione.tsx
// Revisione: Rev. 4
// Data/Ora: 2026-10-01 21:46
// ======================================================================

import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SelettoreLingua } from "@/components/SelettoreLingua";
import { useT } from "@/lib/i18n";
import { FN016_EsciECancellaTutto } from "@/moduli/accesso-controllato/stato";

export function Intestazione({ azione }: { azione?: React.ReactNode }) {
  const t = useT();
  const voce = "rounded-lg border-[1.5px] border-signal bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper";
  const attiva = { className: "rounded-lg border-[1.5px] border-signal bg-signal/10 px-3 py-1.5 text-[13px] font-semibold text-ink" };
  const navigate = useNavigate();
  const qc = useQueryClient();

  // ======================================================================
  // FN062[Esci]: svuota la cache e chiude la sessione mantenendo i dati di licenza sul dispositivo, poi va a /auth.
  // ======================================================================
  async function FN062_Esci() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  // ======================================================================
  // FN063[GestisciEsciECancella]: come Esci, ma cancella anche email, licenza, PUK e consenso salvati sul dispositivo.
  // ======================================================================
  async function FN063_GestisciEsciECancella() {
    await qc.cancelQueries();
    qc.clear();
    await FN016_EsciECancellaTutto();
    navigate({ to: "/auth", replace: true });
  }

  // =====================================================================
  // FN001[ChiudiApplicazione]: svuota la cache, esegue il logout
  // e tenta di chiudere la scheda; se il browser blocca window.close() porta a /auth.
  // =====================================================================
  async function FN001_ChiudiApplicazione() {
    await qc.cancelQueries();
    qc.clear();
    try {
      await supabase.auth.signOut();
    } catch (errore) {
      console.error("ERR900: Logout non riuscito durante la chiusura dell'applicazione", errore);
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
      {/* BT01_ChiudiApplicazione */}
      <div>
        <button type="button" onClick={FN001_ChiudiApplicazione} className={voce}>
          {t("nav.chiudiApp")}
        </button>
      </div>
      <nav className="flex w-full flex-wrap items-center justify-end gap-2 text-[13px]">
        <Link to="/valutazioni" className={voce} activeProps={attiva}>
          {t("nav.valutazioni")}
        </Link>
        <Link to="/impostazioni" className={voce} activeProps={attiva}>
          {t("nav.impostazioni")}
        </Link>
        {/* BT02_Esci */}
        <button type="button" onClick={FN062_Esci} className={voce}>
          {t("nav.esci")}
        </button>
        {/* BT03_EsciECancellaTutto */}
        <button
          type="button"
          onClick={FN063_GestisciEsciECancella}
          className="rounded-lg border-[1.5px] border-danger bg-white px-3 py-1.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger/10"
        >
          {t("nav.esciCancella")}
        </button>
        <SelettoreLingua />
        {azione}
      </nav>
    </header>
  );
}
