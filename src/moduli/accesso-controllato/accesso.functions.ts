// ======================================================================
// Nome File: accesso.functions.ts
// Percorso: src/moduli/accesso-controllato/accesso.functions.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:44
// ======================================================================

// Server function esposte al client. Gli import "server" sono dinamici dentro gli handler, così non entrano nel bundle del browser.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FN004_FormattaErrore } from "./errori";
import type {
  EsitoAttivazione,
  EsitoConsenso,
  EsitoDecremento,
  EsitoRichiestaOtp,
  EsitoVerificaOtp,
  StatoLicenza,
} from "./tipi";

const SCHEMA_LINGUA = z.enum(["it", "en", "de", "es"]);

// ======================================================================
// FN038[EmailDaClaims]: estrae l'email dal token di sessione verificato dal middleware (mai dal corpo della richiesta).
// ======================================================================
function FN038_EmailDaClaims(claims: unknown): string | null {
  const valore = (claims as Record<string, unknown> | null)?.["email"];
  return typeof valore === "string" && valore ? valore.trim().toLowerCase() : null;
}

// ======================================================================
// FN039[RichiediOtpFn]: server function pubblica: genera e invia il codice OTP all'email indicata.
// ======================================================================
export const FN039_RichiediOtpFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ email: z.string().max(255), lingua: SCHEMA_LINGUA }).parse(d),
  )
  .handler(async ({ data }): Promise<EsitoRichiestaOtp> => {
    try {
      const { FN025_RichiediOtp } = await import("./server/otp.server");
      return await FN025_RichiediOtp(data.email, data.lingua);
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { ok: false, codice: "ERR500" };
    }
  });

// ======================================================================
// FN040[VerificaOtpFn]: server function pubblica: verifica il codice OTP e restituisce il token per aprire la sessione.
// ======================================================================
export const FN040_VerificaOtpFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ email: z.string().max(255), codice: z.string().max(12) }).parse(d),
  )
  .handler(async ({ data }): Promise<EsitoVerificaOtp> => {
    try {
      const { FN027_VerificaOtp } = await import("./server/otp.server");
      return await FN027_VerificaOtp(data.email, data.codice);
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { ok: false, codice: "ERR500" };
    }
  });

// ======================================================================
// FN041[AttivaLicenzaFn]: server function protetta: controlla licenza e PUK e assegna il PUK all'utente della sessione.
// ======================================================================
export const FN041_AttivaLicenzaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ licenseKey: z.string().max(200), puk: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<EsitoAttivazione> => {
    const email = FN038_EmailDaClaims(context.claims);
    if (!email) return { ok: false, codice: "ERR015" };
    try {
      const { FN032_AttivaLicenza } = await import("./server/licenza.server");
      return await FN032_AttivaLicenza(email, data.licenseKey, data.puk);
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { ok: false, codice: "ERR500" };
    }
  });

// ======================================================================
// FN042[ControllaStatoLicenzaFn]: server function protetta: rivalida la licenza; in caso di errore transitorio non blocca l'utente (fail-open).
// ======================================================================
export const FN042_ControllaStatoLicenzaFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ licenseId: z.string().max(100) }).parse(d))
  .handler(async ({ data }): Promise<StatoLicenza> => {
    try {
      const { FN029_StatoLicenza } = await import("./server/licenza.server");
      return await FN029_StatoLicenza(data.licenseId);
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { valida: true };
    }
  });

// ======================================================================
// FN043[ControllaConsensoFn]: server function protetta: dice se le condizioni d'uso sono già state accettate per la licenza.
// ======================================================================
export const FN043_ControllaConsensoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ licenseId: z.string().max(100) }).parse(d))
  .handler(async ({ data }): Promise<{ accettato: boolean }> => {
    try {
      const { FN036_ConsensoAccettato } = await import("./server/licenza.server");
      return { accettato: await FN036_ConsensoAccettato(data.licenseId) };
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { accettato: false };
    }
  });

// ======================================================================
// FN044[RegistraConsensoFn]: server function protetta: registra l'accettazione delle condizioni con user agent e IP del client.
// ======================================================================
export const FN044_RegistraConsensoFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ licenseId: z.string().max(100), lingua: SCHEMA_LINGUA }).parse(d),
  )
  .handler(async ({ data }): Promise<EsitoConsenso> => {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const richiesta = getRequest();
      const userAgent = richiesta.headers.get("user-agent");
      const ip =
        richiesta.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        richiesta.headers.get("cf-connecting-ip");
      const { FN037_RegistraConsenso } = await import("./server/licenza.server");
      return await FN037_RegistraConsenso(data.licenseId, data.lingua, userAgent, ip);
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { ok: false, codice: "ERR500" };
    }
  });

// ======================================================================
// FN045[LeggiQuotaPdfFn]: server function protetta: legge gli export PDF residui del PUK (null = illimitati, fail-open).
// ======================================================================
export const FN045_LeggiQuotaPdfFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ pukId: z.string().max(100) }).parse(d))
  .handler(async ({ data, context }): Promise<{ remaining: number | null }> => {
    const email = FN038_EmailDaClaims(context.claims);
    if (!email) return { remaining: null };
    try {
      const { FN034_LeggiQuotaPdf } = await import("./server/licenza.server");
      return { remaining: await FN034_LeggiQuotaPdf(email, data.pukId) };
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { remaining: null };
    }
  });

// ======================================================================
// FN046[DecrementaQuotaPdfFn]: server function protetta: consuma un export PDF del PUK prima della generazione del file.
// ======================================================================
export const FN046_DecrementaQuotaPdfFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ pukId: z.string().max(100) }).parse(d))
  .handler(async ({ data, context }): Promise<EsitoDecremento> => {
    const email = FN038_EmailDaClaims(context.claims);
    if (!email) return { ok: false, codice: "ERR015" };
    try {
      const { FN035_DecrementaQuotaPdf } = await import("./server/licenza.server");
      return await FN035_DecrementaQuotaPdf(email, data.pukId);
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      return { ok: false, codice: "ERR500" };
    }
  });
