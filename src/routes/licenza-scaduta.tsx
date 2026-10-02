// ======================================================================
// Nome File: licenza-scaduta.tsx
// Percorso: src/routes/licenza-scaduta.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:46
// ======================================================================

// Rotta /licenza-scaduta (schermata 0004): file di collegamento verso il modulo accesso-controllato.
import { createFileRoute } from "@tanstack/react-router";
import { FN056_PaginaLicenzaScaduta } from "@/moduli/accesso-controllato/pagine/PaginaLicenzaScaduta";

export const Route = createFileRoute("/licenza-scaduta")({
  head: () => ({
    meta: [
      { title: "Licenza non valida — Riciclabilità PPWR" },
      { name: "description", content: "La licenza non è più valida." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FN056_PaginaLicenzaScaduta,
});
