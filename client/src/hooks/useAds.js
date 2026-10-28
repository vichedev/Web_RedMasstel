import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { advertisementService } from "../services/advertisementService";
import { queryKeys } from "../api/queryClient";
import { getErrorMessage } from "../utils/errorMessage";

export function useAdsAdmin(brand) {
  return useQuery({
    queryKey: queryKeys.ads.listAdmin(brand),
    queryFn: () => advertisementService.findAll(brand),
  });
}

export function useActiveAdsQuery(position, brand) {
  return useQuery({
    queryKey: queryKeys.ads.active(position, brand),
    queryFn: () => advertisementService.findActive(position, brand),
  });
}

export function useAd(id) {
  return useQuery({
    queryKey: queryKeys.ads.detail(id),
    queryFn: () => advertisementService.findOne(id),
    enabled: !!id,
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.ads.all });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: advertisementService.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Publicidad creada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear")),
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => advertisementService.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Publicidad actualizada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo actualizar")),
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: advertisementService.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Publicidad eliminada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo eliminar")),
  });
}

export function useReorderAds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: advertisementService.reorder,
    onSuccess: () => invalidate(qc),
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo guardar el orden")),
  });
}
