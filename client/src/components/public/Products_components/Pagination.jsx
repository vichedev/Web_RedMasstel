import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Calcula qué números mostrar: siempre muestra actual ± 1 y primera/última
  const getPages = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Paginación"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-maastel-500 hover:text-maastel-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
        aria-label="Página anterior"
      >
        <ChevronLeft size={18} />
      </button>

      {getPages().map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-10 w-10 items-center justify-center text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${page === currentPage ? "bg-gradient-to-r from-maastel-700 to-graphite-800 text-white shadow-lg shadow-maastel-500/30" : "border border-gray-200 bg-white text-gray-700 hover:border-maastel-500 hover:text-maastel-600"}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-maastel-500 hover:text-maastel-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
        aria-label="Página siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
