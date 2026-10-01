import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useT } from "@/lib/i18n";
import type { Chiave } from "@/lib/traduzioni";

/** Piccolo "?" accanto a un campo: al clic (o al tocco) mostra un suggerimento nella lingua attiva. */
export function Suggerimento({ chiave }: { chiave: Chiave }) {
  const t = useT();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("hint.apri")}
          title={t("hint.apri")}
          className="no-print ml-1 inline-grid size-4 place-items-center rounded-full border border-mist/60 align-middle text-[10px] font-semibold normal-case leading-none text-mist hover:border-signal hover:text-signal"
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-[12px] font-normal normal-case leading-relaxed tracking-normal">
        {t(chiave)}
      </PopoverContent>
    </Popover>
  );
}
