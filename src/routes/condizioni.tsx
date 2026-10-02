// ======================================================================
// Nome File: condizioni.tsx
// Percorso: src/routes/condizioni.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:46
// ======================================================================

// Rotta /condizioni (schermata 0003): file di collegamento verso il modulo accesso-controllato.
import { createFileRoute } from "@tanstack/react-router";
import { FN054_PaginaCondizioni } from "@/moduli/accesso-controllato/pagine/PaginaCondizioni";

export const Route = createFileRoute("/condizioni")({
  head: () => ({
    meta: [
      { title: "Condizioni d'uso — Riciclabilità PPWR" },
      { name: "description", content: "Accettazione delle condizioni d'uso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FN054_PaginaCondizioni,
});
