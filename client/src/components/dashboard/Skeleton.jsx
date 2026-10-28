/**
 * Primitivas de carga.
 *
 * Las pantallas que esperan datos del backend deben mostrar un esqueleto con la
 * forma del contenido final, no un spinner genérico. Reduce la percepción de
 * latencia y evita el "flash" cuando la respuesta llega rápido.
 */

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonStatsCard() {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
      <div className="flex items-start gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 6, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCardGrid({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-5 ring-1 ring-gray-100"
        >
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
