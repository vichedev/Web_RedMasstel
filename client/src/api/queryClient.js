import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente único de React Query.
 *
 * - `staleTime` 30s: una vez fetcheada, una query se considera fresca durante
 *   30s antes de refetchear si vuelves a montar el componente.
 * - `refetchOnWindowFocus`: vuelve a fetchear al volver a la pestaña — sensación
 *   de "siempre actualizado" en el dashboard.
 * - `retry: 1`: un reintento ante fallos transitorios (no más, para no
 *   amplificar problemas reales).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Keys centralizadas — evitan typos al invalidar. */
export const queryKeys = {
  auth: {
    me: ["auth", "me"],
  },
  users: {
    all: ["users"],
    list: (params = {}) => ["users", "list", params],
    detail: (id) => ["users", "detail", id],
  },
  products: {
    all: ["products"],
    list: (params = {}) => ["products", "list", params],
    listAdmin: ["products", "list-admin"],
    detail: (id) => ["products", "detail", id],
  },
  categories: {
    all: ["categories"],
    list: (onlyActive) => ["categories", "list", { onlyActive }],
    detail: (id) => ["categories", "detail", id],
  },
  promotions: {
    all: ["promotions"],
    listAdmin: (brand) => ["promotions", "list-admin", brand ?? "all"],
    active: (brand) => ["promotions", "active", brand ?? "all"],
    detail: (id) => ["promotions", "detail", id],
  },
  ads: {
    all: ["ads"],
    listAdmin: (brand) => ["ads", "list-admin", brand ?? "all"],
    active: (position, brand) => ["ads", "active", position ?? null, brand ?? "all"],
    detail: (id) => ["ads", "detail", id],
  },
};
