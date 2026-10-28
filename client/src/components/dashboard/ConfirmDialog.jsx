import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  variant = "danger",
  loading = false,
}) {
  const variants = {
    danger: {
      btn: "bg-red-600 hover:bg-red-700",
      icon: "bg-red-100 text-red-600",
    },
    warning: {
      btn: "bg-amber-600 hover:bg-amber-700",
      icon: "bg-amber-100 text-amber-600",
    },
  };
  const style = variants[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.icon}`}
        >
          <AlertTriangle size={22} />
        </div>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${style.btn}`}
        >
          {loading ? "Procesando..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}
