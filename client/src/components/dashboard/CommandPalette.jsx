import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import {
  Search,
  Package,
  Tag,
  Megaphone,
  Image as ImageIcon,
  Users,
  Home,
  User,
  Plus,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useProductsAdmin } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useUsers } from "../../hooks/useUsers";
import { useAuth } from "../../auth/useAuth";
import { buildImageUrl } from "../../utils/imageUrl";

/**
 * Command palette estilo Linear / Notion / Raycast.
 *
 * - `Cmd/Ctrl + K` (o `/`) abre/cierra.
 * - Navegación, búsqueda de productos/etiquetas/usuarios, y acciones rápidas.
 * - Carga datos en background mediante React Query (caché compartida).
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Atajo global Cmd+K / Ctrl+K, también `/` cuando no estamos en un input.
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const inEditable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !inEditable && !open) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Solo cargamos los datos cuando el palette está abierto, para no saturar.
  const { data: products = [] } = useProductsAdmin();
  const { data: categories = [] } = useCategories();
  const { data: users = [] } = useUsers();

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const filteredProducts = useMemo(() => products.slice(0, 8), [products]);
  const filteredCategories = useMemo(() => categories.slice(0, 6), [categories]);
  const filteredUsers = useMemo(() => users.slice(0, 6), [users]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-graphite-950/40 px-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-maastel-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Búsqueda global" loop>
          <div className="flex items-center gap-3 border-b border-gray-100 px-4">
            <Search size={18} className="text-gray-400" />
            <Command.Input
              placeholder="Buscar productos, etiquetas, ir a..."
              className="flex-1 bg-transparent py-4 text-sm text-graphite-900 outline-none placeholder:text-gray-400"
              autoFocus
            />
            <kbd className="hidden rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 sm:inline-block">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto px-2 py-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-500">
              Sin resultados
            </Command.Empty>

            <Command.Group heading="Navegar">
              <CommandItem
                icon={Home}
                label="Ir al dashboard"
                onSelect={() => go("/dashboard")}
              />
              <CommandItem
                icon={Package}
                label="Productos"
                onSelect={() => go("/dashboard/productos")}
              />
              <CommandItem
                icon={Tag}
                label="Etiquetas"
                onSelect={() => go("/dashboard/etiquetas")}
              />
              <CommandItem
                icon={Megaphone}
                label="Promociones"
                onSelect={() => go("/dashboard/promociones")}
              />
              <CommandItem
                icon={ImageIcon}
                label="Publicidad"
                onSelect={() => go("/dashboard/publicidad")}
              />
              {isSuperAdmin && (
                <CommandItem
                  icon={Users}
                  label="Usuarios del sistema"
                  onSelect={() => go("/dashboard/usuarios")}
                />
              )}
              <CommandItem
                icon={User}
                label="Mi perfil"
                onSelect={() => go("/dashboard/perfil")}
              />
            </Command.Group>

            <Command.Group heading="Acciones rápidas">
              <CommandItem
                icon={Plus}
                label="Nuevo producto"
                shortcut="N"
                onSelect={() => go("/dashboard/productos?new=1")}
              />
              <CommandItem
                icon={Plus}
                label="Nueva etiqueta"
                onSelect={() => go("/dashboard/etiquetas?new=1")}
              />
              <CommandItem
                icon={Plus}
                label="Nueva promoción"
                onSelect={() => go("/dashboard/promociones?new=1")}
              />
              <CommandItem
                icon={Plus}
                label="Nueva publicidad"
                onSelect={() => go("/dashboard/publicidad?new=1")}
              />
              <CommandItem
                icon={LogOut}
                label="Cerrar sesión"
                onSelect={() => {
                  setOpen(false);
                  logout().then(() => navigate("/login"));
                }}
              />
            </Command.Group>

            {filteredProducts.length > 0 && (
              <Command.Group heading="Productos">
                {filteredProducts.map((p) => (
                  <Command.Item
                    key={`product-${p.id}`}
                    value={`producto ${p.name} ${p.category?.name ?? ""}`}
                    onSelect={() => go(`/dashboard/productos?edit=${p.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-maastel-50"
                  >
                    {p.imageUrl ? (
                      <img
                        src={buildImageUrl(p.imageUrl)}
                        alt=""
                        className="h-8 w-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                        <Package size={14} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-graphite-900">
                        {p.name}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {p.category?.name || "Sin etiqueta"}
                        {p.price && ` · $${Number(p.price).toFixed(2)}`}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {filteredCategories.length > 0 && (
              <Command.Group heading="Etiquetas">
                {filteredCategories.map((c) => (
                  <CommandItem
                    key={`cat-${c.id}`}
                    icon={Tag}
                    label={c.name}
                    value={`etiqueta ${c.name}`}
                    onSelect={() => go(`/dashboard/etiquetas?edit=${c.id}`)}
                  />
                ))}
              </Command.Group>
            )}

            {isSuperAdmin && filteredUsers.length > 0 && (
              <Command.Group heading="Usuarios">
                {filteredUsers.map((u) => (
                  <CommandItem
                    key={`user-${u.id}`}
                    icon={User}
                    label={u.name}
                    description={u.email}
                    value={`usuario ${u.name} ${u.email}`}
                    onSelect={() => go(`/dashboard/usuarios?edit=${u.id}`)}
                  />
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white px-1.5 py-0.5 ring-1 ring-gray-200">
                  ↑↓
                </kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white px-1.5 py-0.5 ring-1 ring-gray-200">
                  ↵
                </kbd>
                Abrir
              </span>
            </div>
            <span className="hidden sm:inline">Cmd+K para abrir / cerrar</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({ icon: Icon, label, description, value, shortcut, onSelect }) {
  return (
    <Command.Item
      value={value ?? label}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-maastel-50"
    >
      {Icon && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-maastel-50 text-maastel-700">
          <Icon size={14} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-graphite-900">{label}</div>
        {description && (
          <div className="truncate text-xs text-gray-500">{description}</div>
        )}
      </div>
      {shortcut && (
        <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
