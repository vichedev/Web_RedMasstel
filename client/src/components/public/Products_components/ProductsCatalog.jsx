import { useState, useEffect, useRef } from "react";
import { Package } from "lucide-react";
import { productService } from "../../../services/productService";
import { useUrlFilters } from "../../../hooks/useUrlFilters";
import { ProductCard } from "./ProductCard";
import { ProductCardList } from "./ProductCardList";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { ProductFilters } from "./ProductFilters";
import { ProductQuickView } from "./ProductQuickView";
import { Pagination } from "./Pagination";

const DEFAULTS = {
  search: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "DESC",
  page: 1,
  limit: 8,
};

export function ProductsCatalog({
  title = "Planes destacados",
  subtitle = "Explora nuestra selección",
  brand,
}) {
  const { filters, setFilter, setFilters, resetFilters } =
    useUrlFilters(DEFAULTS);
  const [view, setView] = useState("grid");
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const catalogRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        value !== false
      ) {
        params[key] = value;
      }
    });
    if (brand) params.brand = brand;

    productService
      .findAll(params)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.items);
        setMeta(data.meta);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setMeta(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters), brand]);

  // Scroll inteligente: al inicio del catálogo, no de toda la página
  const handlePageChange = (page) => {
    setFilter("page", page);
    if (catalogRef.current) {
      const yOffset = -90; // compensar el navbar fijo
      const y =
        catalogRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Calcula el rango de productos mostrados ("12 de 47")
  const rangeText = meta
    ? `${Math.min((meta.page - 1) * meta.limit + 1, meta.total)} - ${Math.min(meta.page * meta.limit, meta.total)} de ${meta.total}`
    : "";

  return (
    <section ref={catalogRef} id="productos" className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            <div className="mb-3 inline-block rounded-full bg-maastel-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-maastel-600">
              Catálogo
            </div>
            {title && (
              <h2 className="text-4xl font-black text-graphite-900 sm:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto mt-3 max-w-2xl text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        <div className="mb-8">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            view={view}
            onViewChange={setView}
            totalResults={meta?.total ?? null}
            onReset={resetFilters}
          />
        </div>

        {loading && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {Array.from({ length: view === "grid" ? 8 : 4 }).map((_, i) =>
              view === "grid" ? (
                <ProductCardSkeleton key={i} />
              ) : (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl bg-white"
                />
              ),
            )}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-maastel-100 text-maastel-600">
              <Package size={28} />
            </div>
            <h3 className="mt-4 text-xl font-black text-graphite-900">
              No encontramos planes
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-600">
              Prueba ajustando los filtros o buscando con otros términos.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-maastel-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-graphite-800"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div
              className={
                view === "grid"
                  ? "grid animate-in fade-in grid-cols-1 gap-5 duration-500 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-4"
              }
            >
              {products.map((p, idx) =>
                view === "grid" ? (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={idx}
                    onQuickView={setQuickViewProduct}
                  />
                ) : (
                  <ProductCardList
                    key={p.id}
                    product={p}
                    index={idx}
                    onQuickView={setQuickViewProduct}
                  />
                ),
              )}
            </div>

            {/* Paginación con indicador de página y rango */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-12 space-y-4">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                />
                <div className="text-center text-xs text-gray-500">
                  Mostrando{" "}
                  <strong className="text-graphite-900">{rangeText}</strong>{" "}
                  planes · Página{" "}
                  <strong className="text-graphite-900">{meta.page}</strong> de{" "}
                  <strong className="text-graphite-900">
                    {meta.totalPages}
                  </strong>
                </div>
              </div>
            )}

            {/* Si solo hay una página pero hay productos, mostrar el resumen igual */}
            {meta && meta.totalPages === 1 && meta.total > 0 && (
              <div className="mt-10 text-center text-xs text-gray-500">
                Mostrando{" "}
                <strong className="text-graphite-900">{meta.total}</strong>{" "}
                {meta.total === 1 ? "plan" : "planes"}
              </div>
            )}
          </>
        )}
      </div>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </section>
  );
}
