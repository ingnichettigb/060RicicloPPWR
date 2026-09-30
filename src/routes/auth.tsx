import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SelettoreLingua } from "@/components/SelettoreLingua";
import { useT, useTitoloPagina } from "@/lib/i18n";
import { AUTO_LOGIN, entraConAccountProva } from "@/lib/devAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accedi — Riciclabilità PPWR" },
      {
        name: "description",
        content: "Accedi o registrati per salvare online le tue valutazioni di riciclabilità PPWR.",
      },
      { property: "og:title", content: "Accedi — Riciclabilità PPWR" },
      {
        property: "og:description",
        content: "Valutazioni, dati aziendali e logo sincronizzati su tutti i dispositivi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const t = useT();
  useTitoloPagina("auth.titoloPagina");
  const navigate = useNavigate();
  const [modo, setModo] = useState<"accedi" | "registrati">("accedi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/valutazioni", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/valutazioni", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 6) {
      setMsg(t("auth.errValidazione"));
      return;
    }
    setBusy(true);
    try {
      if (modo === "accedi") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/valutazioni` },
        });
        if (error) throw error;
        if (!data.session) setMsg(t("auth.controllaEmail"));
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("auth.errGenerico"));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (r.error) setMsg(t("auth.errGoogle"));
  }

  const campo =
    "mt-1.5 w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px] outline-none focus:border-signal";

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[9px] bg-ink font-display text-[15px] font-bold text-paper">
              R
            </div>
            <div className="font-display text-[15px] font-semibold">{t("app.nome")}</div>
          </Link>
          <SelettoreLingua />
        </div>
        <div className="rise rounded-xl bg-white p-6 ring-1 ring-black/5">
          <h1 className="font-display text-[19px] font-semibold">
            {modo === "accedi" ? t("auth.accedi") : t("auth.crea")}
          </h1>
          <form onSubmit={invia} className="mt-4 space-y-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                {t("auth.email")}
              </span>
              <input
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                className={campo}
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                {t("auth.password")}
              </span>
              <input
                type="password"
                value={password}
                maxLength={72}
                onChange={(e) => setPassword(e.target.value)}
                className={campo}
              />
            </label>
            <button
              disabled={busy}
              className="w-full rounded-lg bg-signal px-4 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
            >
              {modo === "accedi" ? t("auth.accedi") : t("auth.registrati")}
            </button>
          </form>
          <button
            type="button"
            onClick={google}
            className="mt-3 w-full rounded-lg border-[1.5px] border-signal px-4 py-2 text-[13px] font-medium hover:bg-paper"
          >
            {t("auth.google")}
          </button>
          {AUTO_LOGIN && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setMsg(null);
                try {
                  await entraConAccountProva();
                  navigate({ to: "/valutazioni", replace: true });
                } catch (err) {
                  setMsg(err instanceof Error ? err.message : t("auth.errGenerico"));
                } finally {
                  setBusy(false);
                }
              }}
              className="mt-3 w-full rounded-lg border-[1.5px] border-signal bg-signal/10 px-4 py-2 text-[13px] font-medium text-signal hover:bg-signal/15 disabled:opacity-60"
            >
              {t("auth.entraProva")}
            </button>
          )}
          {msg && <p className="mt-3 text-[12px] text-danger">{msg}</p>}
          <button
            type="button"
            onClick={() => setModo(modo === "accedi" ? "registrati" : "accedi")}
            className="mt-4 w-full text-[12px] text-mist hover:text-ink"
          >
            {modo === "accedi" ? t("auth.noAccount") : t("auth.haAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}
