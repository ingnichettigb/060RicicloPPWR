// ======================================================================
// Nome File: PaginaLicenzaScaduta.tsx
// Percorso: src/moduli/accesso-controllato/pagine/PaginaLicenzaScaduta.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Schermata 0004 - Licenza scaduta, disattivata o non trovata.
import { useNavigate } from "@tanstack/react-router";
import { FN015_LeggiMotivoNonValida } from "../stato";
import { CLASSE_PULSANTE } from "../stili";
import { useTestiAccesso } from "../testi";
import { FN065_CorniceAccesso } from "./CorniceAccesso";

// ======================================================================
// FN056[PaginaLicenzaScaduta]: schermata 0004: spiega perché la licenza non è valida e permette di inserirne una nuova.
// ======================================================================
export function FN056_PaginaLicenzaScaduta() {
  const { t } = useTestiAccesso();
  const navigate = useNavigate();
  const motivo = FN015_LeggiMotivoNonValida();

  // ======================================================================
  // FN057[TornaAttivazione]: porta alla schermata di attivazione per inserire una nuova licenza.
  // ======================================================================
  function FN057_TornaAttivazione() {
    navigate({ to: "/attivazione", replace: true });
  }

  return (
    <FN065_CorniceAccesso schermata="0004" titolo={t("sca.titolo")}>
      <p className="mt-4 text-[13px]">{t(`sca.${motivo}`)}</p>
      {/* BT09_TornaAttivazione */}
      <button type="button" onClick={FN057_TornaAttivazione} className={`mt-4 ${CLASSE_PULSANTE}`}>
        {t("sca.riattiva")}
      </button>
    </FN065_CorniceAccesso>
  );
}
