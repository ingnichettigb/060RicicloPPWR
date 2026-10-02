// ======================================================================
// Nome File: route.tsx
// Percorso: src/routes/_authenticated/route.tsx
// Revisione: Rev. 2
// Data/Ora: 2026-10-01 21:46
// ======================================================================

// Layout delle rotte private: sessione Supabase obbligatoria + gate di licenza del modulo accesso-controllato.
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { FN047_PortaAccesso } from "@/moduli/accesso-controllato/PortaAccesso";

// ======================================================================
// FN064[LayoutProtetto]: avvolge tutte le rotte private nel gate di accesso (email verificata, licenza, consenso).
// ======================================================================
function FN064_LayoutProtetto() {
  return (
    <FN047_PortaAccesso>
      <Outlet />
    </FN047_PortaAccesso>
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: FN064_LayoutProtetto,
});
