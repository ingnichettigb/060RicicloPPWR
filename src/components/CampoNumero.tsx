import { useEffect, useState } from "react";
import { useLingua } from "@/lib/i18n";
import { aTesto, daTesto, normalizzaTesto, separatoreDecimale, testoValido } from "@/lib/numeri";

type Props = {
  value: number;
  onChange: (n: number) => void;
  /** valore massimo ammesso (es. 100 per le percentuali) */
  max?: number;
  className?: string;
  ariaLabel?: string;
};

/**
 * Campo numerico: accetta punto o virgola e mostra sempre il separatore della lingua, con al massimo
 * due decimali (le cifre in più vengono tolte). A campo lasciato il numero è mostrato con due decimali.
 */
export function CampoNumero({ value, onChange, max, className, ariaLabel }: Props) {
  const { lingua } = useLingua();
  const sep = separatoreDecimale();
  const [testo, setTesto] = useState(() => aTesto(value, sep));

  // Riallinea il testo solo se il valore cambia dall'esterno o cambia la lingua;
  // mentre si scrive (es. "2,") il testo digitato non viene toccato.
  useEffect(() => {
    if (!testoValido(testo, sep) || daTesto(testo, sep) !== value) setTesto(aTesto(value, sep));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, sep, lingua]);

  return (
    <input
      value={testo}
      inputMode="decimal"
      autoComplete="off"
      aria-label={ariaLabel}
      className={className}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => setTesto(aTesto(daTesto(testo, sep), sep))}
      onChange={(e) => {
        const nuovo = normalizzaTesto(e.target.value, sep);
        const n = daTesto(nuovo, sep);
        if (max !== undefined && n > max) return;
        setTesto(nuovo);
        onChange(n);
      }}
    />
  );
}
