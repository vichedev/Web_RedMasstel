import { useState } from "react";
import { Star, Trash2, Plus, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SortableList, DragHandle } from "../SortableList";
import { uploadService } from "../../../services/uploadService";
import { buildImageUrl } from "../../../utils/imageUrl";
import {
  useProductImages,
  useAddProductImage,
  useRemoveProductImage,
  useSetPrimaryImage,
  useReorderImages,
  useUpdateProductImage,
} from "../../../hooks/useProductImages";

/**
 * Galería multi-imagen para un producto.
 *
 * - Drag & drop con @dnd-kit (mouse + teclado).
 * - Una imagen marcada como principal — se sincroniza con `product.imageUrl`
 *   en el backend.
 * - Editar `alt` inline (importante para SEO + accesibilidad).
 *
 * Requiere que el producto YA exista (productId). Por eso solo se renderiza
 * en modo "edición". Para nuevos productos, primero se crea el producto con
 * una imagen principal y después se añaden secundarias.
 */
export function ProductGallery({ productId }) {
  const { data: images = [], isLoading } = useProductImages(productId);
  const addMut = useAddProductImage(productId);
  const removeMut = useRemoveProductImage(productId);
  const setPrimaryMut = useSetPrimaryImage(productId);
  const reorderMut = useReorderImages(productId);
  const updateMut = useUpdateProductImage(productId);

  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const { url } = await uploadService.uploadImage(file);
        await addMut.mutateAsync({ url, alt: file.name });
      }
      toast.success("Imágenes añadidas");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = (newItems) => {
    const payload = newItems.map((img, idx) => ({
      id: img.id,
      sortOrder: idx,
    }));
    reorderMut.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-graphite-900">
            Galería de imágenes
          </h4>
          <p className="text-xs text-gray-500">
            Arrastra para reordenar. La primera (★) es la imagen principal.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-maastel-300 bg-maastel-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-maastel-700 transition hover:border-maastel-500 hover:bg-maastel-100">
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <ImagePlus size={14} />
              Añadir imágenes
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <ImagePlus
            size={28}
            className="mx-auto text-gray-400"
            strokeWidth={1.5}
          />
          <p className="mt-2 text-sm font-semibold text-gray-700">
            Aún no hay imágenes
          </p>
          <p className="text-xs text-gray-500">
            Sube al menos una imagen para que el producto se vea en el sitio.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SortableList
            items={images}
            onReorder={handleReorder}
            strategy="grid"
            renderItem={(img, { dragHandleProps, isDragging }) => (
              <div
                className={`group relative overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 ${
                  isDragging ? "ring-2 ring-maastel-500" : ""
                } ${img.isPrimary ? "ring-2 ring-maastel-400" : ""}`}
              >
                <img
                  src={buildImageUrl(img.url)}
                  alt={img.alt || ""}
                  className="aspect-square w-full object-cover"
                  draggable={false}
                />

                {img.isPrimary && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-maastel-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-graphite-900 shadow">
                    <Star size={10} fill="currentColor" /> Principal
                  </span>
                )}

                <div className="absolute right-2 top-2">
                  <DragHandle
                    dragHandleProps={dragHandleProps}
                    className="bg-white/90 shadow"
                  />
                </div>

                <div className="border-t border-gray-100 p-3">
                  <input
                    type="text"
                    defaultValue={img.alt ?? ""}
                    placeholder="Texto alternativo (alt)"
                    onBlur={(e) => {
                      const newAlt = e.target.value.trim();
                      if (newAlt !== (img.alt ?? "")) {
                        updateMut.mutate({
                          imageId: img.id,
                          payload: { alt: newAlt },
                        });
                      }
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs focus:border-maastel-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-maastel-200"
                  />
                  <div className="mt-2 flex gap-1">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryMut.mutate(img.id)}
                        className="flex-1 rounded-lg bg-maastel-50 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-maastel-700 transition hover:bg-maastel-100"
                        title="Marcar como principal"
                      >
                        Hacer principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Eliminar esta imagen?")) {
                          removeMut.mutate(img.id);
                        }
                      }}
                      className="rounded-lg bg-red-50 px-2.5 py-1.5 text-red-600 transition hover:bg-red-100"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
