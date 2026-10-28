import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
  Calendar,
  List,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Modal } from "../../components/dashboard/Modal";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { SkeletonCardGrid } from "../../components/dashboard/Skeleton";
import { SortableList, DragHandle } from "../../components/dashboard/SortableList";
import { PromotionForm } from "../../components/dashboard/promotions/PromotionForm";
import { PromotionsCalendar } from "../../components/dashboard/promotions/PromotionsCalendar";
import {
  usePromotionsAdmin,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useReorderPromotions,
} from "../../hooks/usePromotions";
import { buildImageUrl } from "../../utils/imageUrl";

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isWithinWindow(startDate, endDate) {
  const now = Date.now();
  if (startDate && new Date(startDate).getTime() > now) return false;
  if (endDate && new Date(endDate).getTime() < now) return false;
  return true;
}

const BRAND_LABEL = {
  REDMAASTEL: "Red MaasTel",
};

export function PromotionsPage({ brand }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView] = useState("list"); // "list" | "calendar"

  // Mantenemos copia local para optimistic UI durante el drag.
  const [localOrder, setLocalOrder] = useState(null);

  const { data: serverPromotions = [], isLoading } = usePromotionsAdmin(brand);
  const createMut = useCreatePromotion();
  const updateMut = useUpdatePromotion();
  const deleteMut = useDeletePromotion();
  const reorderMut = useReorderPromotions();

  const promotions = localOrder ?? serverPromotions;

  // Sincronizamos cuando cambian los datos del servidor (no estamos arrastrando).
  useEffect(() => {
    if (!reorderMut.isPending) setLocalOrder(null);
  }, [serverPromotions, reorderMut.isPending]);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (p) => {
    setEditing(p);
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
      // hook ya maneja el toast
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
    setLocalOrder(newOrder);
    const items = newOrder.map((p, idx) => ({ id: p.id, displayOrder: idx }));
    reorderMut.mutate(items);
  };

  const submitting = createMut.isPending || updateMut.isPending;
  const activeCount = serverPromotions.filter(
    (p) => p.isActive && isWithinWindow(p.startDate, p.endDate),
  ).length;

  return (
    <>
      <PageHeader
        title={
          brand ? `Promociones · ${BRAND_LABEL[brand] ?? brand}` : "Promociones"
        }
        description={
          brand
            ? `Promociones del microsite ${BRAND_LABEL[brand] ?? brand}. La lista incluye las marcadas como globales.`
            : "Arrastra para reordenar. La primera aparece primero en el hero."
        }
        action={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl"
          >
            <Plus size={16} />
            Nueva promoción
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
              {activeCount === 1 ? "promoción visible" : "promociones visibles"}{" "}
              en el hero
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
            view === "list"
              ? "bg-white text-maastel-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <List size={13} /> Lista
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
            view === "calendar"
              ? "bg-white text-maastel-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar size={13} /> Calendario
        </button>
      </div>

      {isLoading ? (
        <SkeletonCardGrid count={3} />
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin promociones"
          description="Crea tu primera promoción para mostrarla en el hero del sitio."
          primaryAction={{ label: "Nueva promoción", onClick: handleCreate }}
        />
      ) : view === "calendar" ? (
        <PromotionsCalendar
          promotions={promotions}
          onPromotionClick={handleEdit}
        />
      ) : (
        <div className="space-y-3">
          <SortableList
            items={promotions}
            onReorder={handleReorder}
            strategy="vertical"
            renderItem={(p, { dragHandleProps, isDragging }) => {
              const inWindow = isWithinWindow(p.startDate, p.endDate);
              const isLive = p.isActive && inWindow;
              return (
                <div
                  className={`flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition ${
                    isDragging ? "shadow-2xl ring-maastel-400" : "shadow-sm"
                  }`}
                >
                  <DragHandle dragHandleProps={dragHandleProps} />
                  <img
                    src={buildImageUrl(p.imageUrl)}
                    alt={p.title}
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-graphite-900">{p.title}</div>
                    <div className="line-clamp-1 text-xs text-gray-500">
                      {p.description}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {!p.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                          <EyeOff size={10} /> Inactiva
                        </span>
                      ) : !inWindow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          <Calendar size={10} /> Fuera de fecha
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          <Eye size={10} /> En vivo
                        </span>
                      )}
                      {(p.startDate || p.endDate) && (
                        <span className="text-[10px] text-gray-500">
                          {formatDate(p.startDate) || "—"} →{" "}
                          {formatDate(p.endDate) || "—"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="rounded-lg p-2 text-maastel-600 transition hover:bg-maastel-50"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
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
        title={editing ? "Editar promoción" : "Nueva promoción"}
        size="lg"
      >
        <PromotionForm
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
        title="Eliminar promoción"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.title}"?`}
        confirmText="Sí, eliminar"
        loading={deleteMut.isPending}
      />
    </>
  );
}
