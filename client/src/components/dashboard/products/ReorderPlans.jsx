import { useState } from "react";
import { ArrowUp, ArrowDown, Save, EyeOff, Star } from "lucide-react";
import { SortableList, DragHandle } from "../SortableList";
import { buildImageUrl } from "../../../utils/imageUrl";

/**
 * Lista arrastrable para elegir en qué posición sale cada plan en la web.
 * Trabaja sobre una copia local: no guarda nada hasta pulsar "Guardar orden".
 */
export function ReorderPlans({ products, onSave, onCancel, saving }) {
  const [items, setItems] = useState(products);
  const dirty = items.some((p, i) => p.id !== products[i]?.id);

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Arrastra los planes desde el ícono{" "}
        <span className="font-bold text-gray-800">⋮⋮</span> o usa las flechas.
        El <strong>#1</strong> es el primero que se ve en la web. Los planes
        ocultos no aparecen en la web, pero conservan su lugar.
      </p>

      <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
        <SortableList
          items={items}
          onReorder={setItems}
          renderItem={(p, { dragHandleProps, isDragging }) => {
            const index = items.findIndex((x) => x.id === p.id);
            return (
              <div
                className={`flex items-center gap-3 rounded-xl border bg-white p-2.5 transition ${
                  isDragging
                    ? "border-maastel-300 shadow-lg ring-2 ring-maastel-200"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <DragHandle dragHandleProps={dragHandleProps} />
                <span className="w-8 shrink-0 text-center text-sm font-black tabular-nums text-maastel-600">
                  #{index + 1}
                </span>
                {p.imageUrl ? (
                  <img
                    src={buildImageUrl(p.imageUrl)}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-graphite-900">
                      {p.name}
                    </span>
                    {p.isFeatured && (
                      <Star size={12} className="shrink-0 fill-maastel-400 text-maastel-500" />
                    )}
                    {!p.isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                        <EyeOff size={10} /> Oculto
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.downloadSpeed ? `${p.downloadSpeed} Mbps` : "—"}
                    {p.price ? ` · $${Number(p.price).toFixed(2)}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    title="Subir"
                    className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    title="Bajar"
                    className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30"
                  >
                    <ArrowDown size={15} />
                  </button>
                </div>
              </div>
            );
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-500">
          {dirty ? "Cambios sin guardar" : "Sin cambios"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(items)}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-500 to-maastel-700 px-4 py-2 text-sm font-black uppercase tracking-wider text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Guardando…" : "Guardar orden"}
          </button>
        </div>
      </div>
    </div>
  );
}
