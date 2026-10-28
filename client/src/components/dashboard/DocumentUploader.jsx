import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { uploadService } from "../../services/uploadService";
import { buildImageUrl } from "../../utils/imageUrl";

/**
 * Subidor de PDFs paralelo a `ImageUploader`. Notifica al padre con
 * el resultado completo `{ url, originalName, size }` para que pueda
 * persistirlos en el documento.
 *
 * Props:
 *   - value: { url, originalName, size } | null
 *   - onChange(next): se llama con el resultado de la subida o null
 *     al quitar el archivo.
 *   - disabled
 */
export function DocumentUploader({ value, onChange, disabled = false }) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("El archivo debe ser un PDF");
            return;
        }
        if (file.size > 25 * 1024 * 1024) {
            toast.error("El PDF supera los 25 MB");
            return;
        }
        setUploading(true);
        try {
            const result = await uploadService.uploadDocument(file);
            onChange({
                url: result.url,
                originalName: result.originalName ?? file.name,
                size: result.size ?? file.size,
            });
            toast.success("PDF subido");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al subir el PDF");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (disabled || uploading) return;
        handleFile(e.dataTransfer.files[0]);
    };

    const openPicker = () =>
        !disabled && !uploading && inputRef.current?.click();

    // Con archivo: tarjeta compacta con preview
    if (value?.url) {
        const fileName =
            value.originalName ?? value.url.split("/").pop() ?? "documento.pdf";
        const sizeKb = value.size ? Math.round(value.size / 1024) : null;
        const sizeLabel =
            sizeKb !== null
                ? sizeKb >= 1024
                    ? `${(sizeKb / 1024).toFixed(1)} MB`
                    : `${sizeKb} KB`
                : null;

        return (
            <div className="flex items-stretch gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-maastel-50 text-maastel-600">
                    <FileText size={32} strokeWidth={1.8} />
                </div>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            PDF cargado
                        </div>
                        <div
                            className="mt-0.5 truncate text-sm font-semibold text-gray-800"
                            title={fileName}
                        >
                            {fileName}
                        </div>
                        {sizeLabel && (
                            <div className="text-[11px] text-gray-500">{sizeLabel}</div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => handleFile(e.target.files[0])}
                            className="hidden"
                            disabled={disabled || uploading}
                        />
                        <a
                            href={buildImageUrl(value.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-maastel-500 hover:text-maastel-600"
                        >
                            <ExternalLink size={12} />
                            Ver
                        </a>
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
                            onClick={() => onChange(null)}
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

    // Sin archivo: dropzone
    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={openPicker}
            className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition ${disabled
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                    : "cursor-pointer border-gray-300 bg-gray-50 hover:border-maastel-500 hover:bg-maastel-50"
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
                disabled={disabled || uploading}
            />

            <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${uploading ? "bg-maastel-100" : "bg-white"
                    } text-maastel-600`}
            >
                {uploading ? (
                    <Loader2 size={22} className="animate-spin" />
                ) : (
                    <Upload size={22} />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-graphite-900">
                    {uploading ? "Subiendo PDF..." : "Click o arrastra un PDF"}
                </div>
                <div className="text-xs text-gray-500">PDF — máx. 25 MB</div>
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
