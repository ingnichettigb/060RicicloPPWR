import { useLingua } from "@/lib/i18n";
import { LINGUE, NOMI_LINGUE } from "@/lib/traduzioni";

export function SelettoreLingua() {
  const { lingua, setLingua, t } = useLingua();

  return (
    <div
      role="group"
      aria-label={t("lingua.etichetta")}
      className="no-print inline-flex items-center rounded-lg border border-line bg-white p-0.5 font-mono text-[11px]"
    >
      {LINGUE.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLingua(l)}
          aria-pressed={lingua === l}
          title={NOMI_LINGUE[l]}
          className={`rounded-md px-2 py-1 uppercase transition-colors ${
            lingua === l ? "bg-ink text-paper" : "text-mist hover:text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
