// ======================================================================
// Nome File: PaginaAuth.tsx
// Percorso: src/moduli/accesso-controllato/pagine/PaginaAuth.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Schermata 0001 - Accesso con email e codice OTP. Dopo la verifica apre la sessione Supabase.
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "../adattatore";
import { OTP_SCADENZA_MINUTI, ROTTA_HOME, VERIFIED_EMAIL_KEY } from "../config";
import { FN004_FormattaErrore } from "../errori";
import { FN039_RichiediOtpFn, FN040_VerificaOtpFn } from "../accesso.functions";
import { FN008_LeggiChiave, FN011_SalvaEmailVerificata } from "../stato";
import {
  CLASSE_CAMPO,
  CLASSE_ERRORE,
  CLASSE_ETICHETTA,
  CLASSE_PULSANTE,
  CLASSE_PULSANTE_SECONDARIO,
} from "../stili";
import { useTestiAccesso } from "../testi";
import { FN065_CorniceAccesso } from "./CorniceAccesso";

// ======================================================================
// FN048[PaginaAuth]: schermata 0001: richiesta del codice OTP e verifica, poi apertura della sessione.
// ======================================================================
export function FN048_PaginaAuth() {
  const { t, te, lingua } = useTestiAccesso();
  const navigate = useNavigate();
  const [fase, setFase] = useState<"email" | "codice">("email");
  const [email, setEmail] = useState("");
  const [codice, setCodice] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && FN008_LeggiChiave(VERIFIED_EMAIL_KEY)) {
        navigate({ to: ROTTA_HOME, replace: true });
      }
    });
  }, [navigate]);

  // ======================================================================
  // FN049[InviaCodice]: chiede al server di generare e inviare il codice OTP all'email inserita.
  // ======================================================================
  async function FN049_InviaCodice(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const pulita = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(pulita)) {
      setMsg(te("ERR010"));
      return;
    }
    setBusy(true);
    try {
      const esito = await FN039_RichiediOtpFn({ data: { email: pulita, lingua } });
      if (!esito.ok) {
        setMsg(te(esito.codice));
        return;
      }
      setEmail(pulita);
      setCodice("");
      setFase("codice");
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      setMsg(te("ERR500"));
    } finally {
      setBusy(false);
    }
  }

  // ======================================================================
  // FN050[VerificaCodice]: verifica il codice OTP e, se corretto, apre la sessione Supabase e salva l'email verificata.
  // ======================================================================
  async function FN050_VerificaCodice(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const esito = await FN040_VerificaOtpFn({ data: { email, codice: codice.trim() } });
      if (!esito.ok) {
        setMsg(te(esito.codice));
        return;
      }
      const { error } = await supabase.auth.verifyOtp({
        token_hash: esito.tokenHash,
        type: "email",
      });
      if (error) {
        console.error(FN004_FormattaErrore("ERR014"), error.message);
        setMsg(te("ERR014"));
        return;
      }
      FN011_SalvaEmailVerificata(esito.email);
      navigate({ to: ROTTA_HOME, replace: true });
    } catch (errore) {
      console.error(FN004_FormattaErrore("ERR500"), errore);
      setMsg(te("ERR500"));
    } finally {
      setBusy(false);
    }
  }

  // ======================================================================
  // FN051[CambiaEmail]: torna alla fase di inserimento email per richiedere un nuovo codice.
  // ======================================================================
  function FN051_CambiaEmail() {
    setFase("email");
    setCodice("");
    setMsg(null);
  }

  return (
    <FN065_CorniceAccesso schermata="0001" titolo={t("auth.titolo")}>
      {fase === "email" ? (
        <form onSubmit={FN049_InviaCodice} className="mt-4 space-y-3">
          <p className="text-[13px] text-muted-foreground">{t("auth.intro")}</p>
          <label className="block">
            <span className={CLASSE_ETICHETTA}>{t("auth.email")}</span>
            <input
              id="0001_InputEmailUtente"
              name="0001_InputEmailUtente"
              type="email"
              autoComplete="email"
              value={email}
              maxLength={255}
              onChange={(ev) => setEmail(ev.target.value)}
              className={CLASSE_CAMPO}
            />
          </label>
          {/* BT04_InviaCodiceOtp */}
          <button type="submit" disabled={busy} className={CLASSE_PULSANTE}>
            {busy ? t("auth.inviando") : t("auth.invia")}
          </button>
        </form>
      ) : (
        <form onSubmit={FN050_VerificaCodice} className="mt-4 space-y-3">
          <p className="text-[13px] text-muted-foreground">
            {t("auth.codiceInviato", { email, minuti: OTP_SCADENZA_MINUTI })}
          </p>
          <label className="block">
            <span className={CLASSE_ETICHETTA}>{t("auth.codice")}</span>
            <input
              id="0002_InputCodiceOtp"
              name="0002_InputCodiceOtp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={codice}
              maxLength={6}
              onChange={(ev) => setCodice(ev.target.value.replace(/\D/g, ""))}
              className={CLASSE_CAMPO}
            />
          </label>
          {/* BT05_VerificaCodiceOtp */}
          <button type="submit" disabled={busy || codice.length !== 6} className={CLASSE_PULSANTE}>
            {busy ? t("auth.verificando") : t("auth.verifica")}
          </button>
          {/* BT06_CambiaEmail */}
          <button
            type="button"
            disabled={busy}
            onClick={FN051_CambiaEmail}
            className={CLASSE_PULSANTE_SECONDARIO}
          >
            {t("auth.cambiaEmail")}
          </button>
        </form>
      )}
      {msg && (
        <p role="alert" className={CLASSE_ERRORE}>
          {msg}
        </p>
      )}
    </FN065_CorniceAccesso>
  );
}
