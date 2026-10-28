import {
  ShieldCheck,
  Shield,
  Package,
  Tag,
  Megaphone,
  Image as ImageIcon,
  Users,
  Settings,
} from "lucide-react";

export const ROLES = {
  SUPER_ADMIN: {
    key: "SUPER_ADMIN",
    label: "Super Administrador",
    shortLabel: "Super Admin",
    description:
      "Control total del sistema. Puede gestionar todo el contenido y también administrar otros usuarios del panel.",
    icon: ShieldCheck,
    color: "from-maastel-400 to-maastel-500",
    textColor: "text-maastel-700",
    bgColor: "bg-maastel-100",
    ringColor: "ring-maastel-300",
    darkText: true,
    permissions: [
      { icon: Package, label: "Productos", scope: "Crear, editar y eliminar" },
      { icon: Tag, label: "Etiquetas", scope: "Crear, editar y eliminar" },
      {
        icon: Megaphone,
        label: "Promociones",
        scope: "Crear, editar y eliminar",
      },
      {
        icon: ImageIcon,
        label: "Publicidad",
        scope: "Crear, editar y eliminar",
      },
      { icon: Users, label: "Usuarios admin", scope: "Gestión completa" },
      { icon: Settings, label: "Configuración", scope: "Acceso total" },
    ],
  },
  ADMIN: {
    key: "ADMIN",
    label: "Administrador",
    shortLabel: "Admin",
    description:
      "Gestiona el contenido público del sitio web. No puede administrar otros usuarios del panel.",
    icon: Shield,
    color: "from-maastel-500 to-maastel-700",
    textColor: "text-maastel-700",
    bgColor: "bg-maastel-100",
    ringColor: "ring-maastel-300",
    darkText: false,
    permissions: [
      { icon: Package, label: "Productos", scope: "Crear, editar y eliminar" },
      { icon: Tag, label: "Etiquetas", scope: "Crear, editar y eliminar" },
      {
        icon: Megaphone,
        label: "Promociones",
        scope: "Crear, editar y eliminar",
      },
      {
        icon: ImageIcon,
        label: "Publicidad",
        scope: "Crear, editar y eliminar",
      },
    ],
  },
};

export function getRoleInfo(roleKey) {
  return ROLES[roleKey] || ROLES.ADMIN;
}
