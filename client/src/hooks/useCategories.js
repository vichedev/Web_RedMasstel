import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "../services/categoryService";
import { queryKeys } from "../api/queryClient";
import { getErrorMessage } from "../utils/errorMessage";

export function useCategories({ onlyActive = false } = {}) {
  return useQuery({
    queryKey: queryKeys.categories.list(onlyActive),
    queryFn: () => categoryService.findAll(onlyActive),
  });
}

export function useCategoryTree({ onlyActive = false } = {}) {
  return useQuery({
    queryKey: ["categories", "tree", { onlyActive }],
    queryFn: () => categoryService.findTree(onlyActive),
  });
}

export function useMoveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => categoryService.move(id, payload),
    onSuccess: () => invalidate(qc),
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo mover la etiqueta")),
  });
}

export function useCategory(id) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoryService.findOne(id),
    enabled: !!id,
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.categories.all });
  // Las etiquetas afectan los listados de productos del lado público.
  qc.invalidateQueries({ queryKey: queryKeys.products.all });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Etiqueta creada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear")),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => categoryService.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Etiqueta actualizada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo actualizar")),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Etiqueta eliminada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo eliminar")),
  });
}
