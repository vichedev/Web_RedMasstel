import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { emailConfigService } from "../services/emailConfigService";
import { getErrorMessage } from "../utils/errorMessage";
import { clearEmailServiceCache } from "../services/emailService";

const emailConfigKey = ["email-config"];

export function useEmailConfig() {
  return useQuery({
    queryKey: emailConfigKey,
    queryFn: emailConfigService.findOne,
    staleTime: 60 * 60_000,
  });
}

export function useUpdateEmailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: emailConfigService.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: emailConfigKey });
      // El emailService público cachea las creds en memoria. Tras un
      // update válido, refrescamos el cache para que el siguiente envío
      // use las nuevas credenciales sin tener que recargar la página.
      clearEmailServiceCache();
      toast.success("Configuración de EmailJS actualizada");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "No se pudo actualizar EmailJS")),
  });
}
