import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentService } from "../services/documentService";
import { getErrorMessage } from "../utils/errorMessage";

const documentKeys = {
  all: ["documents"],
  active: (brand) => ["documents", "active", brand ?? "all"],
  footer: (brand) => ["documents", "footer", brand ?? "all"],
  admin: (brand) => ["documents", "admin", brand ?? "all"],
};

export function useActiveDocuments(brand) {
  return useQuery({
    queryKey: documentKeys.active(brand),
    queryFn: () => documentService.findActive(brand),
    staleTime: 60 * 60_000,
  });
}

export function useFooterDocuments(brand) {
  return useQuery({
    queryKey: documentKeys.footer(brand),
    queryFn: () => documentService.findFooter(brand),
    staleTime: 60 * 60_000,
  });
}

export function useAdminDocuments(brand) {
  return useQuery({
    queryKey: documentKeys.admin(brand),
    queryFn: () => documentService.findAllAdmin(brand),
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: documentKeys.all });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: documentService.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Documento creado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo crear el documento")),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => documentService.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success("Documento actualizado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo actualizar el documento")),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: documentService.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success("Documento eliminado");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo eliminar el documento")),
  });
}
