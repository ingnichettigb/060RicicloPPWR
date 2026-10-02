// ======================================================================
// Nome File: auth.tsx
// Percorso: src/routes/auth.tsx
// Revisione: Rev. 2
// Data/Ora: 2026-10-01 21:46
// ======================================================================

// Rotta /auth (schermata 0001): file di collegamento verso il modulo accesso-controllato.
import { createFileRoute } from "@tanstack/react-router";
import { FN048_PaginaAuth } from "@/moduli/accesso-controllato/pagine/PaginaAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accedi — Riciclabilità PPWR" },
      { name: "description", content: "Accedi con il codice di verifica inviato per email." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FN048_PaginaAuth,
});
