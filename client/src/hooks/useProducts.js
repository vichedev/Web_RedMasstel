import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productService } from "../services/productService";
import { queryKeys } from "../api/queryClient";
import { getErrorMessage } from "../utils/errorMessage";

export function useProducts(params = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productService.findAll(params),
  });
}

export function useProductsAdmin(filters = {}) {
  return useQuery({
    queryKey: [...queryKeys.products.listAdmin, filters],
    queryFn: () => productService.findAllAdmin(filters),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.findOne(id),
    enabled: !!id,
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.products.all });
}

/**
 * Guarda el orden de los planes. Recibe la lista ya ordenada; la posición
 * de cada plan es su índice (0 = primero en la web).
 */
export function useReorderProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedProducts) =>
      productService.reorder(
        orderedProducts.map((p, i) => ({ id: p.id, displayOrder: i })),
      ),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Orden de los planes guardado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo guardar el orden")),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Producto creado");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear")),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => productService.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Producto actualizado");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo actualizar")),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Producto eliminado");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo eliminar")),
  });
}

export function useBulkUpdateProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, patch }) => productService.bulkUpdate(ids, patch),
    onSuccess: (data) => {
      invalidate(qc);
      toast.success(`${data?.affected ?? "Varios"} productos actualizados`);
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo actualizar el lote")),
  });
}

export function useBulkDeleteProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => productService.bulkRemove(ids),
    onSuccess: (data) => {
      invalidate(qc);
      toast.success(`${data?.affected ?? "Varios"} productos eliminados`);
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo eliminar el lote")),
  });
}
