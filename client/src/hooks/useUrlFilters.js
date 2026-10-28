import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Lee y escribe filtros en la URL como querystring.
 * defaults: objeto con los valores por defecto para cada filtro.
 */
export function useUrlFilters(defaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Construye el objeto de filtros leyendo de la URL, cayendo en defaults si no existe
  const filters = {};
  Object.keys(defaults).forEach((key) => {
    const value = searchParams.get(key);
    if (value === null || value === "") {
      filters[key] = defaults[key];
    } else if (typeof defaults[key] === "number") {
      filters[key] = Number(value);
    } else if (typeof defaults[key] === "boolean") {
      filters[key] = value === "true";
    } else {
      filters[key] = value;
    }
  });

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (
            value === "" ||
            value === null ||
            value === undefined ||
            value === defaults[key]
          ) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          // Al cambiar cualquier filtro (excepto page), volvemos a página 1
          if (key !== "page") next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaults],
  );

  const setFilters = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (
              value === "" ||
              value === null ||
              value === undefined ||
              value === defaults[key]
            ) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          if (!("page" in updates)) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaults],
  );

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return { filters, setFilter, setFilters, resetFilters };
}
