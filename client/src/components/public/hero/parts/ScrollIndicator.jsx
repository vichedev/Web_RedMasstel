import { ChevronDown } from "lucide-react";

/** Flecha animada en el fondo del Hero que sugiere "hay más abajo". */
export function ScrollIndicator() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-1 text-maastel-200">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
        Desliza
      </span>
      <ChevronDown size={20} className="animate-bounce-soft" />
    </div>
  );
}
