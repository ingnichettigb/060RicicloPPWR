// ======================================================================
// Nome File: DialogExportEsauriti.tsx
// Percorso: src/moduli/accesso-controllato/esportazione/DialogExportEsauriti.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Frame 0005 - Dialog bloccante: plafond di export PDF esaurito. Si chiude solo con "Ho capito".
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTestiAccesso } from "../testi";

// ======================================================================
// FN061[DialogExportEsauriti]: frame 0005: avvisa che il PUK ha esaurito gli export PDF; niente chiusura con clic esterno o tasto Esc.
// ======================================================================
export function FN061_DialogExportEsauriti({
  aperto,
  onChiudi,
}: {
  aperto: boolean;
  onChiudi: () => void;
}) {
  const { t } = useTestiAccesso();
  return (
    <AlertDialog open={aperto} onOpenChange={() => {}}>
      <AlertDialogContent data-schermata="0005" onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("quota.titoloEsaurito")}</AlertDialogTitle>
          <AlertDialogDescription>{t("quota.testoEsaurito")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* BT10_ConfermaExportEsauriti */}
          <AlertDialogAction onClick={onChiudi}>{t("quota.capito")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
