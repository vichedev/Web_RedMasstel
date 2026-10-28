import { useEffect, useRef, useState } from "react";

/**
 * Cuenta regresiva visual con dígitos que "saltan" al cambiar.
 *
 * - Si quedan < 24h: tono rojo + pulse urgente.
 * - Si quedan < 7d: tono ámbar.
 * - Si la fecha ya pasó o falta más de un mes: no se renderiza.
 */
export function Countdown({ endDate }) {
  const target = endDate ? new Date(endDate).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  if (days > 30) return null; // muy lejos: no muestres nada

  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  const isUrgent = diff < 86_400_000; // < 24h
  const isWarn = diff < 7 * 86_400_000 && !isUrgent;

  const containerStyles = isUrgent
    ? "border-red-400/40 bg-red-500/10"
    : isWarn
      ? "border-maastel-400/40 bg-maastel-400/10"
      : "border-white/15 bg-white/5";
  const labelColor = isUrgent
    ? "text-red-300"
    : isWarn
      ? "text-maastel-300"
      : "text-maastel-200";

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur ${containerStyles} ${
        isUrgent ? "animate-urgent-pulse" : ""
      }`}
    >
      <div
        className={`text-[10px] font-black uppercase tracking-[0.2em] ${labelColor}`}
      >
        {isUrgent ? "Termina hoy" : isWarn ? "Termina pronto" : "Disponible"}
      </div>

      <div className="flex items-center gap-1.5 text-white">
        <DigitGroup value={days} label="d" />
        <Separator />
        <DigitGroup value={hours} label="h" />
        <Separator />
        <DigitGroup value={minutes} label="m" />
        <Separator />
        <DigitGroup value={seconds} label="s" highlight />
      </div>
    </div>
  );
}

function DigitGroup({ value, label, highlight }) {
  const padded = String(value).padStart(2, "0");
  const prev = useRef(padded);
  const flipping = prev.current !== padded;
  if (flipping) prev.current = padded;

  return (
    <div className="flex items-baseline gap-1">
      <span
        key={padded /* re-mount triggers flip animation */}
        className={`min-w-[2ch] text-center font-mono text-xl font-black tabular-nums ${
          highlight ? "text-maastel-300" : ""
        } ${flipping ? "animate-digit-flip" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {padded}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-maastel-200">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="text-maastel-300/60">:</span>;
}
