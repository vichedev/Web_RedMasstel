import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { branchService } from "../services/branchService";
import { getErrorMessage } from "../utils/errorMessage";

const branchKeys = {
  all: ["branches"],
  list: (onlyActive) => ["branches", "list", { onlyActive }],
};

export function useBranches({ onlyActive = false } = {}) {
  return useQuery({
    queryKey: branchKeys.list(onlyActive),
    queryFn: () => branchService.findAll(onlyActive),
    // El público no necesita refetch agresivo: los teléfonos cambian poco.
    staleTime: 5 * 60_000,
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ brand, payload }) => branchService.update(brand, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: branchKeys.all });
      toast.success("Sucursal actualizada");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo actualizar la sucursal")),
  });
}
