// ======================================================================
// Nome File: Intestazione.tsx
// Percorso: src/components/Intestazione.tsx
// Revisione: Rev. 5 (email utente connesso a fianco di Chiudi Applicazione)
// Data/Ora: 2026-10-03 15:05
// ======================================================================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SelettoreLingua } from "@/components/SelettoreLingua";
import { useT } from "@/lib/i18n";
import { VERIFIED_EMAIL_KEY } from "@/moduli/accesso-controllato/config";
import { FN008_LeggiChiave, FN016_EsciECancellaTutto } from "@/moduli/accesso-controllato/stato";

export function Intestazione({ azione }: { azione?: React.ReactNode }) {
  const t = useT();
  const voce =
    "rounded-lg border-[1.5px] border-signal bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper";
  const attiva = {
    className: "rounded-lg border-[1.5px] border-signal bg-signal/10 px-3 py-1.5 text-[13px] font-semibold text-ink",
  };
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Email dell'utente connesso (letta subito da localStorage o dalla sessione Supabase)
  const [emailUtente, setEmailUtente] = useState<string | null>(() => FN008_LeggiChiave(VERIFIED_EMAIL_KEY));

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setEmailUtente(data.user.email);
      }
    });
  }, []);

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
    // Tentativo di chiusura della scheda (i browser la consentono solo se aperta da script).
    window.close();
    // Fallback: se la scheda resta aperta, si torna alla schermata di accesso.
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="no-print flex flex-wrap items-center justify-between gap-3">
      {/* Sinistra: Logo + Nome applicazione */}
      <Link to="/valutazioni" className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-[9px] bg-ink font-display text-[15px] font-bold text-paper">
          R
        </div>
        <div>
          <div className="font-display text-[15px] font-semibold leading-none tracking-tight">{t("app.nome")}</div>
          <div className="font-mono text-[11px] text-mist">{t("app.sottotitolo")}</div>
        </div>
      </Link>

      {/* Destra prima riga: Email utente connesso + Tasto Chiudi applicazione */}
      <div className="flex items-center gap-3">
        {emailUtente && (
          <div
            title={`Connesso come: ${emailUtente}`}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-paper/60 px-2.5 py-1 text-[12px] font-mono text-mist"
          >
            <User className="size-3.5 text-signal" />
            <span className="max-w-[200px] truncate sm:max-w-[320px]">{emailUtente}</span>
          </div>
        )}

        {/* BT01_ChiudiApplicazione */}
        <button type="button" onClick={FN001_ChiudiApplicazione} className={voce}>
          {t("nav.chiudiApp")}
        </button>
      </div>

      {/* Seconda riga: Navigazione principale */}
      <nav className="flex w-full flex-wrap items-center justify-end gap-2 text-[13px]">
        <Link to="/valutazioni" className={voce} activeProps={attiva}>
          {t("nav.valutazioni")}
        </Link>
        <Link to="/impostazioni" className={voce} activeProps={attiva}>
          {t("nav.impostazioni")}
        </Link>
        <Link
          to="/guida"
          title={t("nav.guida")}
          aria-label={t("nav.guida")}
          className="grid size-8 place-items-center rounded-full border-[1.5px] border-signal bg-white font-display text-[14px] font-bold italic text-ink transition-colors hover:bg-paper"
        >
          i
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
