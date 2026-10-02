// ======================================================================
// Nome File: CorniceAccesso.tsx
// Percorso: src/moduli/accesso-controllato/pagine/CorniceAccesso.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Cornice grafica comune alle schermate di accesso (logo, selettore lingua, scheda centrale).
import { useEffect, type ReactNode } from "react";
import { APP_NAME } from "../config";
import { SelettoreLingua } from "../adattatore";

// ======================================================================
// FN065[CorniceAccesso]: disegna la cornice comune delle schermate di accesso e imposta il titolo della scheda del browser.
// ======================================================================
export function FN065_CorniceAccesso({
  schermata,
  titolo,
  children,
}: {
  schermata: string;
  titolo: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${titolo} — ${APP_NAME}`;
  }, [titolo]);

  return (
    <div
      data-schermata={schermata}
      className="grid min-h-screen place-items-center bg-background px-6 text-foreground"
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[9px] bg-foreground font-display text-[15px] font-bold text-background">
              {APP_NAME.charAt(0)}
            </div>
            <div className="font-display text-[15px] font-semibold">{APP_NAME}</div>
          </div>
          <SelettoreLingua />
        </div>
        <div className="rise rounded-xl bg-card p-6 ring-1 ring-black/5">
          <h1 className="font-display text-[19px] font-semibold">{titolo}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
