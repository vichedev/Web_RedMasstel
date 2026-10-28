import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService } from "../services/userService";
import { queryKeys } from "../api/queryClient";
import { getErrorMessage } from "../utils/errorMessage";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: userService.findAll,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Usuario creado");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear el usuario")),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => userService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Usuario actualizado");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo actualizar")),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Usuario eliminado");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo eliminar")),
  });
}
