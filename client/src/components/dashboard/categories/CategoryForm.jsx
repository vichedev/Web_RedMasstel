import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useCategories } from "../../../hooks/useCategories";

const INITIAL = {
  name: "",
  description: "",
  isActive: true,
  parentId: "",
};

/**
 * Devuelve el set de IDs que NO pueden ser padre de `selfId`:
 * el propio nodo y todos sus descendientes.
 */
function descendantIds(allCategories, selfId) {
  if (!selfId) return new Set();
  const childrenByParent = new Map();
  for (const c of allCategories) {
    const arr = childrenByParent.get(c.parentId ?? null) ?? [];
    arr.push(c.id);
    childrenByParent.set(c.parentId ?? null, arr);
  }
  const blocked = new Set([selfId]);
  const stack = [selfId];
  while (stack.length) {
    const id = stack.pop();
    const children = childrenByParent.get(id) ?? [];
    for (const cid of children) {
      if (!blocked.has(cid)) {
        blocked.add(cid);
        stack.push(cid);
      }
    }
  }
  return blocked;
}

export function CategoryForm({
  initialData = null,
  defaultParentId = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(INITIAL);
  const { data: allCategories = [] } = useCategories();

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
        parentId: initialData.parentId ?? "",
      });
    } else {
      setForm({ ...INITIAL, parentId: defaultParentId ?? "" });
    }
  }, [initialData, defaultParentId]);

  const blockedIds = useMemo(
    () => descendantIds(allCategories, initialData?.id),
    [allCategories, initialData?.id],
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");
    onSubmit({
      ...form,
      parentId: form.parentId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
          Nombre *
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={submitting}
          placeholder="Ej: Abarrotes"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
          Etiqueta padre
        </label>
        <select
          name="parentId"
          value={form.parentId}
          onChange={handleChange}
          disabled={submitting}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
        >
          <option value="">— Sin padre (raíz) —</option>
          {allCategories
            .filter((c) => !blockedIds.has(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Las sub-etiquetas heredan visualmente del padre en el sitio público.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
          Descripción
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={submitting}
          rows={3}
          placeholder="Breve descripción de la etiqueta (opcional)"
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
        />
      </div>

      <div className="rounded-xl bg-gray-50 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            disabled={submitting}
            className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
          />
          Activa (visible en la web)
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
        >
          {submitting
            ? "Guardando..."
            : initialData
              ? "Actualizar"
              : "Crear etiqueta"}
        </button>
      </div>
    </form>
  );
}
