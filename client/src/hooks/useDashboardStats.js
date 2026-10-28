import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardService.getStats,
    // Refresca cada 60s para mantener KPIs vivos sin saturar la API.
    refetchInterval: 60_000,
  });
}
