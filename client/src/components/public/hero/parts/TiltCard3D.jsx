import { useRef, useState } from "react";

/**
 * Wrapper 3D: el contenido reacciona al cursor con un tilt sutil (max 8deg)
 * y una luz que sigue al puntero. Se desactiva en pantallas táctiles
 * (los `mousemove` no se disparan ahí, así que el efecto simplemente no aplica).
 */
export function TiltCard3D({
  children,
  className = "",
  maxTilt = 8,
  glowOpacity = 0.18,
}) {
  const ref = useRef(null);
  const [transform, setTransform] = useState("");
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -2 * maxTilt; // up = +tilt, down = -tilt
    const ry = (px - 0.5) * 2 * maxTilt;
    setTransform(
      `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`,
    );
    setGlowPos({ x: px * 100, y: py * 100 });
  };

  const handleLeave = () => {
    setTransform("perspective(1200px) rotateX(0) rotateY(0) scale(1)");
    setHovered(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{
        transform,
        transition: hovered
          ? "transform 80ms ease-out"
          : "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className={`relative ${className}`}
    >
      {children}
      {/* Reflejo de luz que sigue al cursor */}
      {hovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,${glowOpacity}), transparent 50%)`,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
}
