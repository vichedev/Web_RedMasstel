import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { externalLinkService } from "../services/externalLinkService";
import { getErrorMessage } from "../utils/errorMessage";

const linkKeys = {
  all: ["external-links"],
  active: (brand) => ["external-links", "active", brand ?? "all"],
  footer: (brand) => ["external-links", "footer", brand ?? "all"],
  admin: (brand) => ["external-links", "admin", brand ?? "all"],
};

export function useActiveExternalLinks(brand) {
  return useQuery({
    queryKey: linkKeys.active(brand),
    queryFn: () => externalLinkService.findActive(brand),
    staleTime: 60 * 60_000,
  });
}

export function useFooterExternalLinks(brand) {
  return useQuery({
    queryKey: linkKeys.footer(brand),
    queryFn: () => externalLinkService.findFooter(brand),
    staleTime: 60 * 60_000,
  });
}

export function useAdminExternalLinks(brand) {
  return useQuery({
    queryKey: linkKeys.admin(brand),
    queryFn: () => externalLinkService.findAllAdmin(brand),
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: linkKeys.all });
}

export function useCreateExternalLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: externalLinkService.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Enlace creado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo crear el enlace")),
  });
}

export function useUpdateExternalLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => externalLinkService.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Enlace actualizado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo actualizar el enlace")),
  });
}

export function useDeleteExternalLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: externalLinkService.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Enlace eliminado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo eliminar el enlace")),
  });
}
