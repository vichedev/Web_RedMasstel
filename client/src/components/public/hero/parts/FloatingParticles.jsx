import { useMemo } from "react";

/**
 * Capa de partículas decorativas que flotan suavemente. Cada partícula
 * tiene tamaño, posición y delay aleatorio (calculados una sola vez
 * con `useMemo`) para que el render sea estable entre frames.
 *
 * No interfiere con clicks (`pointer-events-none`).
 */
export function FloatingParticles({ count = 12 }) {
    const particles = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                id: i,
                size: 2 + Math.random() * 4,
                left: Math.random() * 100,
                top: Math.random() * 100,
                delay: Math.random() * 4,
                duration: 5 + Math.random() * 6,
            })),
        [count],
    );

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="absolute rounded-full bg-white/40 blur-[1px]"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        animation: `float-slow ${p.duration}s ease-in-out ${p.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}
