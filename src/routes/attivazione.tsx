// ======================================================================
// Nome File: attivazione.tsx
// Percorso: src/routes/attivazione.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:46
// ======================================================================

// Rotta /attivazione (schermata 0002): file di collegamento verso il modulo accesso-controllato.
import { createFileRoute } from "@tanstack/react-router";
import { FN052_PaginaAttivazione } from "@/moduli/accesso-controllato/pagine/PaginaAttivazione";

export const Route = createFileRoute("/attivazione")({
  head: () => ({
    meta: [
      { title: "Attiva la licenza — Riciclabilità PPWR" },
      { name: "description", content: "Attivazione della licenza con chiave e codice PUK." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FN052_PaginaAttivazione,
});
