import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Intestazione } from "@/components/Intestazione";
import { useT, useTitoloPagina, type T } from "@/lib/i18n";
import { salvaAzienda, useAzienda } from "@/lib/archivio";
import { AZIENDA_VUOTA, type Azienda } from "@/lib/ppwr";

export const Route = createFileRoute("/_authenticated/impostazioni")({
  head: () => ({
    meta: [
      { title: "Impostazioni azienda — Riciclabilità PPWR" },
      {
        name: "description",
        content:
          "Imposta ragione sociale, partita IVA, sede, referente e logo che compaiono sull'intestazione dei report di riciclabilità.",
      },
      { property: "og:title", content: "Impostazioni azienda — Riciclabilità PPWR" },
      {
        property: "og:description",
        content: "Dati e logo dell'azienda che compila la valutazione di riciclabilità PPWR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Impostazioni,
});

const campi = (t: T): { chiave: keyof Azienda; etichetta: string; placeholder: string }[] => [
  {
    chiave: "ragioneSociale",
    etichetta: t("imp.ragioneSociale"),
    placeholder: t("imp.phRagioneSociale"),
  },
  { chiave: "partitaIva", etichetta: t("imp.partitaIva"), placeholder: t("imp.phPartitaIva") },
  { chiave: "indirizzo", etichetta: t("imp.sede"), placeholder: t("imp.phSede") },
  { chiave: "referente", etichetta: t("imp.referente"), placeholder: t("imp.phReferente") },
  { chiave: "email", etichetta: t("imp.email"), placeholder: t("imp.phEmail") },
];

function Impostazioni() {
  const t = useT();
  useTitoloPagina("imp.titoloPagina");
  const { azienda: salvata } = useAzienda();
  const qc = useQueryClient();
  const [form, setForm] = useState<Azienda>(AZIENDA_VUOTA);
  const [salvato, setSalvato] = useState(false);

  useEffect(() => setForm(salvata), [salvata]);

  function caricaLogo(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_500_000) {
      alert(t("imp.logoTroppoGrande"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logoDataUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function salva() {
    try {
      await salvaAzienda(form);
      await qc.invalidateQueries({ queryKey: ["azienda"] });
    } catch (e) {
      alert(e instanceof Error ? e.message : t("imp.errSalvataggio"));
      return;
    }
    setSalvato(true);
    setTimeout(() => setSalvato(false), 2000);
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1180px] px-6 py-7">
        <Intestazione />

        <div className="mt-6 flex items-baseline gap-3">
          <h1 className="font-display text-[19px] font-semibold leading-tight">
            {t("imp.titolo")}
          </h1>
          <span className="font-mono text-[11px] text-mist">{t("imp.sotto")}</span>
        </div>

        <div className="rise mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_352px]">
          <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
            <div className="grid gap-4 sm:grid-cols-2">
              {campi(t).map((c) => (
                <label key={c.chiave} className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                    {c.etichetta}
                  </span>
                  <input
                    value={form[c.chiave]}
                    placeholder={c.placeholder}
                    onChange={(e) => setForm({ ...form, [c.chiave]: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px] outline-none focus:border-signal"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={salva}
              className="mt-6 rounded-lg bg-signal px-4 py-2 text-[13px] font-medium text-primary-foreground ring-1 ring-signal/40"
            >
              {salvato ? t("imp.salvato") : t("imp.salva")}
            </button>
          </div>

          <aside className="rounded-xl bg-white p-5 ring-1 ring-black/5">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
              {t("imp.logo")}
            </div>
            <div className="mt-3 grid h-28 place-items-center rounded-lg border border-dashed border-line bg-paper">
              {form.logoDataUrl ? (
                <img
                  src={form.logoDataUrl}
                  alt={t("comune.logoAlt")}
                  className="max-h-24 max-w-[80%]"
                />
              ) : (
                <span className="text-[11px] text-mist">{t("imp.nessunLogo")}</span>
              )}
            </div>
            <label className="mt-3 block cursor-pointer rounded-lg border-[1.5px] border-signal px-3 py-2 text-center text-[12px] font-medium hover:bg-paper">
              {t("imp.carica")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => caricaLogo(e.target.files?.[0])}
              />
            </label>
            {form.logoDataUrl && (
              <button
                type="button"
                onClick={() => setForm({ ...form, logoDataUrl: "" })}
                className="mt-2 w-full text-[11px] text-mist hover:text-danger"
              >
                {t("imp.rimuovi")}
              </button>
            )}
            <p className="mt-4 text-[11px] leading-relaxed text-mist">{t("imp.notaLogo")}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
