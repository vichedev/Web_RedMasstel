import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  EyeOff,
} from "lucide-react";

/**
 * Árbol de etiquetas con expand/collapse y acciones por nodo.
 *
 * No usa drag-drop (más complejidad para añadir poco valor: el orden
 * raíz va por sortOrder y el padre se cambia desde el form). En su lugar:
 * - botón "Nueva sub-etiqueta" en cada nodo
 * - botón "Mover" abre un selector de padre
 *
 * Esto evita los pitfalls de drag-drop entre niveles distintos del árbol.
 */
export function CategoryTree({
  nodes,
  onCreate,
  onEdit,
  onDelete,
  onAddChild,
  level = 0,
}) {
  if (!nodes || nodes.length === 0) {
    if (level === 0) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          Sin etiquetas. Crea la primera para comenzar.
        </div>
      );
    }
    return null;
  }

  return (
    <ul className={level === 0 ? "space-y-1" : "ml-6 space-y-1 border-l border-gray-200 pl-3"}>
      {nodes.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          level={level}
        />
      ))}
    </ul>
  );
}

function CategoryNode({ node, onEdit, onDelete, onAddChild, level }) {
  const hasChildren = node.children && node.children.length > 0;
  const [open, setOpen] = useState(level < 1); // primer nivel abierto, resto cerrado

  return (
    <li>
      <div
        className={`group flex items-center gap-2 rounded-lg p-2 transition hover:bg-gray-50 ${
          !node.isActive ? "opacity-60" : ""
        }`}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={open ? "Colapsar" : "Expandir"}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-6" />
        )}

        <div className="flex h-6 w-6 items-center justify-center text-maastel-600">
          {hasChildren && open ? (
            <FolderOpen size={14} />
          ) : (
            <Folder size={14} />
          )}
        </div>

        <span className="flex-1 truncate text-sm font-semibold text-graphite-900">
          {node.name}
          {!node.isActive && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-600">
              <EyeOff size={9} /> Inactiva
            </span>
          )}
          {hasChildren && (
            <span className="ml-2 text-[10px] font-semibold text-gray-400">
              ({node.children.length})
            </span>
          )}
        </span>

        <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onAddChild(node)}
            className="rounded p-1.5 text-emerald-600 transition hover:bg-emerald-50"
            title="Crear sub-etiqueta"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(node)}
            className="rounded p-1.5 text-maastel-600 transition hover:bg-maastel-50"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(node)}
            className="rounded p-1.5 text-red-600 transition hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {hasChildren && open && (
        <CategoryTree
          nodes={node.children}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          level={level + 1}
        />
      )}
    </li>
  );
}
