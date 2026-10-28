import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "../../services/uploadService";
import { buildImageUrl } from "../../utils/imageUrl";

export function ImageUploader({ value, onChange, disabled = false }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera los 5MB");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      onChange(result.url);
      toast.success("Imagen subida");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;
    handleFile(e.dataTransfer.files[0]);
  };

  const openPicker = () => !disabled && !uploading && inputRef.current?.click();

  // Con imagen: preview compacta lateral
  if (value) {
    return (
      <div className="flex items-stretch gap-3 rounded-xl border border-gray-200 bg-white p-2">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={buildImageUrl(value)}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Imagen cargada
            </div>
            <div className="mt-0.5 truncate text-[11px] text-gray-500">
              {value.split("/").pop()}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
              disabled={disabled || uploading}
            />
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-maastel-500 hover:text-maastel-600 disabled:opacity-50"
            >
              <RefreshCw size={12} />
              Cambiar
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <X size={12} />
              Quitar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sin imagen: zona de drop compacta
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={openPicker}
      className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition ${disabled ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60" : "cursor-pointer border-gray-300 bg-gray-50 hover:border-maastel-500 hover:bg-maastel-50"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${uploading ? "bg-maastel-100" : "bg-white"} text-maastel-600`}
      >
        {uploading ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <Upload size={22} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-graphite-900">
          {uploading ? "Subiendo imagen..." : "Click o arrastra una imagen"}
        </div>
        <div className="text-xs text-gray-500">JPG, PNG, WebP — máx. 5MB</div>
      </div>

      {!uploading && (
        <div className="hidden sm:block">
          <div className="rounded-lg bg-maastel-700 px-3 py-1.5 text-xs font-bold text-white">
            Seleccionar
          </div>
        </div>
      )}
    </div>
  );
}
