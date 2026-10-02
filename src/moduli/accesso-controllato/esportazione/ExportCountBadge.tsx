// ======================================================================
// Nome File: ExportCountBadge.tsx
// Percorso: src/moduli/accesso-controllato/esportazione/ExportCountBadge.tsx
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:45
// ======================================================================

// Pallino con il numero di export PDF residui, da mettere sul pulsante di generazione PDF (il pulsante deve avere "relative").
import { useTestiAccesso } from "../testi";

// ======================================================================
// FN060[ExportCountBadge]: mostra il numero di export residui con tooltip nelle 4 lingue; con count null (illimitati) non mostra nulla.
// ======================================================================
export function FN060_ExportCountBadge({ count }: { count: number | null }) {
  const { t } = useTestiAccesso();
  if (count === null) return null;
  const titolo = count === 1 ? t("quota.ultimo") : t("quota.tooltip", { n: count });
  const colore =
    count <= 1
      ? "bg-destructive text-destructive-foreground"
      : "bg-primary text-primary-foreground";
  return (
    <span
      title={titolo}
      aria-label={titolo}
      className={`pointer-events-none absolute -left-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ring-2 ring-background ${colore}`}
    >
      {count}
    </span>
  );
}
