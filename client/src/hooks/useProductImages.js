import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productService } from "../services/productService";
import { queryKeys } from "../api/queryClient";
import { getErrorMessage } from "../utils/errorMessage";

const imagesKey = (productId) => ["products", "images", productId];

export function useProductImages(productId) {
  return useQuery({
    queryKey: imagesKey(productId),
    queryFn: () => productService.listImages(productId),
    enabled: !!productId,
  });
}

function invalidate(qc, productId) {
  qc.invalidateQueries({ queryKey: imagesKey(productId) });
  qc.invalidateQueries({ queryKey: queryKeys.products.all });
}

export function useAddProductImage(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => productService.addImage(productId, payload),
    onSuccess: () => invalidate(qc, productId),
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo añadir la imagen")),
  });
}

export function useUpdateProductImage(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, payload }) =>
      productService.updateImage(productId, imageId, payload),
    onSuccess: () => invalidate(qc, productId),
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo actualizar")),
  });
}

export function useRemoveProductImage(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId) => productService.removeImage(productId, imageId),
    onSuccess: () => {
      invalidate(qc, productId);
      toast.success("Imagen eliminada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo eliminar")),
  });
}

export function useSetPrimaryImage(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId) => productService.setPrimaryImage(productId, imageId),
    onSuccess: () => {
      invalidate(qc, productId);
      toast.success("Imagen principal actualizada");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo cambiar la principal")),
  });
}

export function useReorderImages(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items) => productService.reorderImages(productId, items),
    onSuccess: () => invalidate(qc, productId),
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo guardar el orden")),
  });
}
