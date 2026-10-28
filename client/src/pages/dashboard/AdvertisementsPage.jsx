import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
  ZoomIn,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Modal } from "../../components/dashboard/Modal";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { SkeletonCardGrid } from "../../components/dashboard/Skeleton";
import { SortableList, DragHandle } from "../../components/dashboard/SortableList";
import { AdvertisementForm } from "../../components/dashboard/advertisements/AdvertisementForm";
import { ImageLightbox } from "../../components/public/ImageLightbox";
import {
  useAdsAdmin,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
  useReorderAds,
} from "../../hooks/useAds";
import { buildImageUrl } from "../../utils/imageUrl";

const POSITION_LABELS = {
  HOME_TOP: { label: "Home Superior", color: "bg-blue-100 text-blue-700" },
  HOME_MIDDLE: { label: "Home Medio", color: "bg-purple-100 text-purple-700" },
  HOME_BOTTOM: {
    label: "Home Inferior",
    color: "bg-emerald-100 text-emerald-700",
  },
};

const BRAND_LABEL = {
  REDMAASTEL: "Red MaasTel",
};

export function AdvertisementsPage({ brand }) {
  const [filter, setFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [localOrder, setLocalOrder] = useState(null);

  const { data: serverAds = [], isLoading } = useAdsAdmin(brand);
  const createMut = useCreateAd();
  const updateMut = useUpdateAd();
  const deleteMut = useDeleteAd();
  const reorderMut = useReorderAds();

  const ads = localOrder ?? serverAds;

  useEffect(() => {
    if (!reorderMut.isPending) setLocalOrder(null);
  }, [serverAds, reorderMut.isPending]);

  const filteredAds = useMemo(() => {
    if (filter === "ALL") return ads;
    return ads.filter((a) => a.position === filter);
  }, [ads, filter]);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (a) => {
    setEditing(a);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      const finalPayload =
        brand && payload.brand === undefined
          ? { ...payload, brand }
          : payload;
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: finalPayload });
      } else {
        await createMut.mutateAsync(finalPayload);
      }
      setModalOpen(false);
    } catch {
      // hook ya maneja
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // hook ya maneja
    }
  };

  const handleReorder = (newOrder) => {
    if (filter !== "ALL") {
      // Solo permitimos reorder cuando se ven todas (para no confundir orden global vs filtrado).
      return;
    }
    setLocalOrder(newOrder);
    const items = newOrder.map((a, idx) => ({ id: a.id, displayOrder: idx }));
    reorderMut.mutate(items);
  };

  const submitting = createMut.isPending || updateMut.isPending;
  const activeCount = serverAds.filter((a) => a.isActive).length;

  return (
    <>
      <PageHeader
        title={brand ? `Publicidad · ${BRAND_LABEL[brand] ?? brand}` : "Publicidad"}
        description={
          brand
            ? `Banners visibles en el microsite ${BRAND_LABEL[brand] ?? brand}. La lista incluye los marcados como globales (visibles en los 3 microsites).`
            : "Banners por posición. Arrastra (en vista 'Todas') para reordenar el global."
        }
        action={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl"
          >
            <Plus size={16} />
            Nueva publicidad
          </button>
        }
      />

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-maastel-700 to-graphite-900 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-maastel-400 text-graphite-900">
            <Megaphone size={24} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-maastel-400">
              En vivo ahora
            </div>
            <div className="text-2xl font-black">
              {activeCount}{" "}
              {activeCount === 1
                ? "publicidad visible"
                : "publicidades visibles"}{" "}
              en la web
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${filter === "ALL" ? "bg-maastel-700 text-white shadow-lg" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-maastel-300"}`}
        >
          Todas ({serverAds.length})
        </button>
        {Object.entries(POSITION_LABELS).map(([key, info]) => {
          const count = serverAds.filter((a) => a.position === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${filter === key ? "bg-maastel-700 text-white shadow-lg" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-maastel-300"}`}
            >
              {info.label} ({count})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <SkeletonCardGrid count={3} />
      ) : filteredAds.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin publicidad en esta vista"
          description={
            serverAds.length === 0
              ? "Crea tu primer banner publicitario."
              : "No hay banners para el filtro seleccionado."
          }
          primaryAction={
            serverAds.length === 0
              ? { label: "Nueva publicidad", onClick: handleCreate }
              : undefined
          }
          secondaryAction={
            serverAds.length > 0
              ? { label: "Quitar filtro", onClick: () => setFilter("ALL") }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <SortableList
            items={filteredAds}
            onReorder={handleReorder}
            strategy="vertical"
            renderItem={(a, { dragHandleProps, isDragging }) => {
              const info = POSITION_LABELS[a.position] || {
                label: a.position,
                color: "bg-gray-100 text-gray-600",
              };
              return (
                <div
                  className={`flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition ${
                    isDragging ? "shadow-2xl ring-maastel-400" : "shadow-sm"
                  }`}
                >
                  {filter === "ALL" && (
                    <DragHandle dragHandleProps={dragHandleProps} />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxImage({
                        url: buildImageUrl(a.imageUrl),
                        title: a.title,
                      })
                    }
                    className="group relative shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-200 transition hover:ring-maastel-500"
                  >
                    <img
                      src={buildImageUrl(a.imageUrl)}
                      alt={a.title}
                      className="h-16 w-24 object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-graphite-900/0 transition group-hover:bg-graphite-900/50">
                      <ZoomIn
                        size={16}
                        className="text-white opacity-0 transition group-hover:opacity-100"
                      />
                    </div>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-graphite-900">
                        {a.title}
                      </span>
                      {a.badgeText && (
                        <span className="rounded-full bg-maastel-100 px-2 py-0.5 text-[9px] font-bold uppercase text-maastel-700">
                          {a.badgeText}
                        </span>
                      )}
                    </div>
                    {a.subtitle && (
                      <div className="line-clamp-1 text-xs text-gray-600">
                        {a.subtitle}
                      </div>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${info.color}`}
                      >
                        {info.label}
                      </span>
                      {a.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          <Eye size={10} /> Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                          <EyeOff size={10} /> Oculta
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => handleEdit(a)}
                      className="rounded-lg p-2 text-maastel-600 transition hover:bg-maastel-50"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar publicidad" : "Nueva publicidad"}
        size="lg"
      >
        <AdvertisementForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          lockedBrand={brand ?? null}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar publicidad"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.title}"?`}
        confirmText="Sí, eliminar"
        loading={deleteMut.isPending}
      />

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.url}
          alt={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
