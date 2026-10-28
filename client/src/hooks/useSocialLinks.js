import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { socialLinkService } from "../services/socialLinkService";
import { getErrorMessage } from "../utils/errorMessage";

const socialKeys = {
  all: ["social-links"],
  public: (brand) => ["social-links", "public", brand ?? "all"],
  admin: (brand) => ["social-links", "admin", brand ?? "all"],
};

export function usePublicSocialLinks(brand) {
  return useQuery({
    queryKey: socialKeys.public(brand),
    queryFn: () => socialLinkService.findPublic(brand),
    staleTime: 60 * 60_000,
  });
}

export function useAdminSocialLinks(brand) {
  return useQuery({
    queryKey: socialKeys.admin(brand),
    queryFn: () => socialLinkService.findAllAdmin(brand),
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: socialKeys.all });
}

export function useCreateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: socialLinkService.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Red social creada");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo crear la red social")),
  });
}

export function useUpdateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => socialLinkService.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Red social actualizada");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo actualizar la red social")),
  });
}

export function useDeleteSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: socialLinkService.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Red social eliminada");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo eliminar la red social")),
  });
}
