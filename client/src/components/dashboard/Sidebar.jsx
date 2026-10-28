import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Wifi,
  Tag,
  Megaphone,
  Image as ImageIcon,
  Palette,
  Phone,
  FileText,
  Link as LinkIcon,
  Share2,
  Mail,
  Users,
  Activity,
  X,
  Package,
  Cookie,
} from "lucide-react";
import logo from "../../assets/logo-redmaastel.svg";
import { useAuth } from "../../auth/useAuth";

/**
 * Navegación del panel de Red MaasTel. Con marca única, todas las
 * secciones del sitio viven en un solo bloque; el resto son secciones
 * globales (catálogo, configuración, sistema).
 */
const SITE_SECTION = {
  title: "Red MaasTel",
  items: [
    { label: "Planes", path: "/dashboard/planes", icon: Wifi, end: true },
    { label: "Sucursal", path: "/dashboard/sucursal", icon: Phone },
    { label: "Redes sociales", path: "/dashboard/redes-sociales", icon: Share2 },
    { label: "Enlaces útiles", path: "/dashboard/enlaces", icon: LinkIcon },
    { label: "Identidad visual", path: "/dashboard/identidad", icon: Palette },
    { label: "Promociones", path: "/dashboard/promociones", icon: Megaphone },
    { label: "Publicidad", path: "/dashboard/publicidad", icon: ImageIcon },
    { label: "Documentos", path: "/dashboard/documentos", icon: FileText },
  ],
};

const GLOBAL_SECTIONS = [
  {
    title: "Catálogo",
    items: [{ label: "Etiquetas", path: "/dashboard/etiquetas", icon: Tag }],
  },
  {
    title: "Configuración",
    items: [{ label: "EmailJS", path: "/dashboard/email", icon: Mail }],
  },
  {
    title: "Sistema",
    items: [
      {
        label: "Usuarios",
        path: "/dashboard/usuarios",
        icon: Users,
        requireRole: "SUPER_ADMIN",
      },
      {
        label: "Actividad",
        path: "/dashboard/actividad",
        icon: Activity,
        requireRole: "SUPER_ADMIN",
      },
      { label: "Cookies", path: "/dashboard/cookies", icon: Cookie },
    ],
  },
];

/**
 * Sidebar del panel de administración de Red MaasTel.
 */
export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  // Filtra items por rol y descarta secciones que queden vacías.
  const visibleGlobals = GLOBAL_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.requireRole || user?.role === item.requireRole,
    ),
  })).filter((section) => section.items.length > 0);

  const renderSection = (section) => (
    <div key={section.title} className="mt-6">
      <div className="mb-2 flex items-center gap-2 px-3">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-maastel-400/80">
          {section.title}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-maastel-400/30 to-transparent" />
      </div>

      <ul className="space-y-0.5">
        {section.items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive
                    ? "bg-gradient-to-r from-maastel-500 to-maastel-600 text-white shadow-lg shadow-maastel-500/20"
                    : "text-maastel-200 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={17} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-graphite-950 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_0%,rgba(237, 125, 43,0.3),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(222, 101, 23,0.15),transparent)]" />

        {/* Cabecera */}
        <div className="relative flex items-center justify-between border-b border-white/10 p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl bg-white/95 px-3 py-2 shadow-lg transition hover:bg-white"
          >
            <img
              src={logo}
              alt="Red MaasTel"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-maastel-400">
              Admin Panel
            </div>
            <button
              onClick={onClose}
              className="mt-1 text-maastel-300 transition hover:text-white lg:hidden"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="relative flex-1 overflow-y-auto scrollbar-none px-3 py-4">
          {/* Resumen */}
          <ul className="space-y-0.5">
            <li>
              <NavLink
                to="/dashboard"
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive
                    ? "bg-gradient-to-r from-maastel-500 to-maastel-600 text-white shadow-lg shadow-maastel-500/20"
                    : "text-maastel-200 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <LayoutDashboard size={17} className="shrink-0" />
                <span className="truncate">Resumen</span>
              </NavLink>
            </li>
          </ul>

          {/* Sección del sitio Red MaasTel */}
          {renderSection(SITE_SECTION)}

          {/* Secciones globales */}
          {visibleGlobals.map(renderSection)}
        </nav>

        {/* Footer del sidebar */}
        <div className="relative border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3 text-xs text-maastel-300">
            <p className="font-bold text-white">¿Necesitas ayuda?</p>
            <p className="mt-1">
              Gestiona aquí los planes, sucursal e identidad de Red MaasTel.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
