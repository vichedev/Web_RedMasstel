import { useEffect, useState } from "react";

/**
 * Cursor personalizado dentro del Hero: círculo amarillo que sigue al mouse
 * y se transforma según el contexto. Se monta solo cuando el ratón está sobre
 * el contenedor.
 */
export function CustomCursor({ containerRef, label = "Click" }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target;
      const interactive =
        target instanceof HTMLElement &&
        (target.closest("a, button, [role=button], input, textarea, select") !==
          null);
      setIsInteractive(interactive);
    };
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [containerRef]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[9999] flex items-center justify-center"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        transition: "width 200ms ease, height 200ms ease, background 200ms ease",
      }}
    >
      <div
        className={`flex items-center justify-center rounded-full transition-all ${
          isInteractive
            ? "h-16 w-16 bg-maastel-400 text-graphite-900"
            : "h-8 w-8 bg-white/20 backdrop-blur-sm"
        }`}
        style={{
          mixBlendMode: isInteractive ? "normal" : "difference",
        }}
      >
        {isInteractive && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
