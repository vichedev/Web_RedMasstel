import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Grid3x3,
  List,
} from "lucide-react";
import { useDebounce } from "react-use";

const SORT_OPTIONS = [
  { value: "createdAt-DESC", label: "Más recientes" },
  { value: "createdAt-ASC", label: "Más antiguos" },
  { value: "name-ASC", label: "Nombre A-Z" },
  { value: "name-DESC", label: "Nombre Z-A" },
  { value: "price-ASC", label: "Precio menor" },
  { value: "price-DESC", label: "Precio mayor" },
];

const PAGE_SIZE_OPTIONS = [8, 12, 24, 48];

export function ProductFilters({
  filters,
  onChange,
  view,
  onViewChange,
  totalResults,
  onReset,
}) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useDebounce(
    () => {
      if (searchInput !== filters.search) {
        onChange({ search: searchInput, page: 1 });
      }
    },
    400,
    [searchInput],
  );

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const currentSort = `${filters.sortBy}-${filters.sortOrder}`;
  const hasActiveFilters =
    filters.search || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar planes..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm placeholder:text-gray-400 focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={currentSort}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-");
            onChange({ sortBy, sortOrder, page: 1 });
          }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Selector de productos por página */}
        <select
          value={filters.limit || 8}
          onChange={(e) => onChange({ limit: Number(e.target.value), page: 1 })}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
          title="Planes por página"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${showAdvanced ? "border-maastel-500 bg-maastel-50 text-maastel-700" : "border-gray-200 bg-white text-gray-700 hover:border-maastel-500"}`}
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-maastel-400 text-[10px] font-black text-graphite-900">
              !
            </span>
          )}
        </button>

        <div className="hidden items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 sm:flex">
          <button
            onClick={() => onViewChange("grid")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${view === "grid" ? "bg-maastel-700 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            aria-label="Vista cuadrícula"
          >
            <Grid3x3 size={16} />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${view === "list" ? "bg-maastel-700 text-white" : "text-gray-500 hover:bg-gray-100"}`}
            aria-label="Vista lista"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-700">
            Filtrar por precio
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Precio mínimo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  onChange({
                    minPrice:
                      e.target.value === "" ? "" : Number(e.target.value),
                    page: 1,
                  })
                }
                placeholder="$0.00"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Precio máximo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  onChange({
                    maxPrice:
                      e.target.value === "" ? "" : Number(e.target.value),
                    page: 1,
                  })
                }
                placeholder="$999.99"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resumen de resultados */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div className="text-sm text-gray-600">
          {totalResults !== null && (
            <>
              Mostrando{" "}
              <strong className="text-graphite-900">{totalResults}</strong>{" "}
              {totalResults === 1 ? "plan" : "planes"}
            </>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-maastel-600 transition hover:text-graphite-800"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
