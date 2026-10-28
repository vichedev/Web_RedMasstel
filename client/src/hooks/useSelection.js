import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Manejo de selección múltiple para listados.
 *
 * - `toggle(id)`: alterna un item.
 * - `toggleAll(visibleIds)`: si todos están seleccionados, limpia; si no, los añade.
 * - `Esc` limpia la selección.
 */
export function useSelection() {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") clear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clear]);

  const toggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  }, []);

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selected: selectedIds,
    selectedArray,
    count: selectedIds.size,
    toggle,
    toggleAll,
    clear,
    isSelected,
  };
}
