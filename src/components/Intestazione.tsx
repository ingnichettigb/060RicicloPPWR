import { Link } from "@tanstack/react-router";

export function Intestazione({ azione }: { azione?: React.ReactNode }) {
  const voce = "px-3 py-1.5 text-mist hover:text-ink transition-colors rounded-md";
  const attiva = { className: "px-3 py-1.5 rounded-md bg-ink/5 font-medium text-ink" };

  return (
    <header className="no-print flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-[9px] bg-ink font-display text-[15px] font-bold text-paper">
          R
        </div>
        <div>
          <div className="font-display text-[15px] font-semibold leading-none tracking-tight">
            Riciclabilità PPWR
          </div>
          <div className="font-mono text-[11px] text-mist">
            Determinazione % riciclabilità · Reg. (UE) 2025/40
          </div>
        </div>
      </Link>
      <nav className="flex items-center gap-1 text-[13px]">
        <Link to="/" className={voce} activeOptions={{ exact: true }} activeProps={attiva}>
          Valutazioni
        </Link>
        <Link to="/impostazioni" className={voce} activeProps={attiva}>
          Impostazioni
        </Link>
        {azione}
      </nav>
    </header>
  );
}
