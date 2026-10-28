import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { promotionService } from "../services/promotionService";
import { queryKeys } from "../api/queryClient";
import { getErrorMessage } from "../utils/errorMessage";

export function usePromotionsAdmin(brand) {
  return useQuery({
    queryKey: queryKeys.promotions.listAdmin(brand),
    queryFn: () => promotionService.findAll(brand),
  });
}

export function useActivePromotions(brand) {
  return useQuery({
    queryKey: queryKeys.promotions.active(brand),
    queryFn: () => promotionService.findActive(brand),
  });
}

export function usePromotion(id) {
  return useQuery({
    queryKey: queryKeys.promotions.detail(id),
    queryFn: () => promotionService.findOne(id),
    enabled: !!id,
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.promotions.all });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promotionService.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Promoción creada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear")),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => promotionService.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Promoción actualizada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo actualizar")),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promotionService.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Promoción eliminada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo eliminar")),
  });
}

export function useReorderPromotions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promotionService.reorder,
    onSuccess: () => invalidate(qc),
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo guardar el orden")),
  });
}
