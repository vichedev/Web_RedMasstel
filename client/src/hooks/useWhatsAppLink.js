import { useCallback, useMemo } from "react";
import { useBranches } from "./useBranches";
import { buildWhatsAppLink } from "../config/brand";

/**
 * Devuelve un builder `(brandKey, plan) => string | null` que resuelve
 * el WhatsApp de la sucursal correspondiente a la marca.
 *
 * Estrategia de fallback:
 *   1. Sucursal activa con `whatsappPhone` cargado desde el dashboard.
 *   2. Variable de entorno `VITE_WHATSAPP_*` (compatibilidad legacy).
 *   3. `null` si no hay ningún número → el botón se deshabilita.
 */
export function useWhatsAppLink() {
  const { data: branches = [] } = useBranches({ onlyActive: true });

  const phonesByBrand = useMemo(() => {
    const map = {};
    for (const branch of branches) {
      if (branch?.brand && branch.whatsappPhone) {
        map[branch.brand] = branch.whatsappPhone;
      }
    }
    return map;
  }, [branches]);

  return useCallback(
    (brandKey, plan) =>
      buildWhatsAppLink(brandKey, plan, phonesByBrand[brandKey]),
    [phonesByBrand],
  );
}
