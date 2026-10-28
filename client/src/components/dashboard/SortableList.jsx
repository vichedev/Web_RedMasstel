import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

/**
 * Lista reordenable accesible (teclado + mouse).
 *
 * Props:
 *   items:       array con `id` único en cada elemento
 *   onReorder:   (newItems) => void  — array reordenado tras un drop
 *   renderItem:  (item, { dragHandleProps, isDragging }) => ReactNode
 *   strategy:    "vertical" (default) | "grid"
 */
export function SortableList({
  items,
  onReorder,
  renderItem,
  strategy = "vertical",
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={
          strategy === "grid" ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {(props) => renderItem(item, props)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
    "aria-label": "Arrastrar para reordenar",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps, isDragging })}
    </div>
  );
}

/** Handle con icono visible — pásalo dentro de tu renderItem. */
export function DragHandle({ dragHandleProps, className = "" }) {
  return (
    <button
      type="button"
      {...dragHandleProps}
      className={`flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing ${className}`}
      title="Arrastrar para reordenar"
    >
      <GripVertical size={16} />
    </button>
  );
}
