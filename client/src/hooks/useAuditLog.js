import { useQuery } from "@tanstack/react-query";
import { auditService } from "../services/auditService";

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["audit", "recent", limit],
    queryFn: () => auditService.recent(limit),
    refetchInterval: 30_000,
  });
}

export function useAuditLog(params = {}) {
  return useQuery({
    queryKey: ["audit", "list", params],
    queryFn: () => auditService.list(params),
  });
}
