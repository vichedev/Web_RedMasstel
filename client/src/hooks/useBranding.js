import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { brandingService } from "../services/brandingService";
import { getErrorMessage } from "../utils/errorMessage";
import { buildImageUrl } from "../utils/imageUrl";

const brandingKeys = {
  all: ["branding"],
};

/**
 * Devuelve el listado completo de slots de branding desde la API.
 * El público lo consume al cargar el navbar/footer/hero.
 */
export function useBranding() {
  return useQuery({
    queryKey: brandingKeys.all,
    queryFn: brandingService.findAll,
    // Los logos cambian poco — basta con refrescar a la hora.
    staleTime: 60 * 60_000,
  });
}

/**
 * Devuelve un mapa { slot: { url, alt, label } } para acceso O(1).
 * `url` viene resuelto con `buildImageUrl` para que sea usable directo
 * en `<img src=...>`. Si el slot no existe o no tiene url, devuelve
 * `null` en `url` y deja al caller decidir el fallback.
 */
export function useBrandingMap() {
  const { data: assets = [], isLoading } = useBranding();
  const map = useMemo(() => {
    const out = {};
    for (const asset of assets) {
      out[asset.slot] = {
        url: asset.url ? buildImageUrl(asset.url) : null,
        rawUrl: asset.url ?? null,
        alt: asset.alt ?? asset.label ?? "",
        label: asset.label,
      };
    }
    return out;
  }, [assets]);
  return { map, isLoading };
}

export function useUpdateBrandingAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slot, payload }) => brandingService.update(slot, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandingKeys.all });
      toast.success("Logo actualizado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo actualizar el logo")),
  });
}
