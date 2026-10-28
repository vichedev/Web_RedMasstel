import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Shield,
  Users as UsersIcon,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DataTable } from "../../components/dashboard/DataTable";
import { Modal } from "../../components/dashboard/Modal";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import { EmptyState } from "../../components/dashboard/EmptyState";
import {
  SkeletonStatsCard,
  SkeletonTable,
} from "../../components/dashboard/Skeleton";
import { UserForm } from "../../components/dashboard/users/UserForm";
import { RoleBadge } from "../../components/dashboard/users/RoleBadge";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../hooks/useUsers";
import { useAuth } from "../../auth/useAuth";
import { getRoleInfo } from "../../utils/roles";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [filter, setFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const { data: users = [], isLoading } = useUsers();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();

  const submitting = createMut.isPending || updateMut.isPending;
  const deleting = deleteMut.isPending;

  const stats = useMemo(() => {
    const superAdmins = users.filter((u) => u.role === "SUPER_ADMIN").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const active = users.filter((u) => u.isActive).length;
    return {
      total: users.length,
      superAdmins,
      admins,
      active,
      inactive: users.length - active,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (filter === "ALL") return users;
    if (filter === "INACTIVE") return users.filter((u) => !u.isActive);
    return users.filter((u) => u.role === filter);
  }, [users, filter]);

  if (!isSuperAdmin) {
    return (
      <>
        <PageHeader
          title="Usuarios"
          description="Gestiona los administradores del sistema."
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Lock size={28} />
          </div>
          <h3 className="mt-4 text-xl font-black text-amber-900">
            Acceso restringido
          </h3>
          <p className="mt-2 max-w-md text-sm text-amber-800">
            Solo los usuarios con rol <strong>Super Administrador</strong>{" "}
            pueden gestionar otros administradores del sistema.
          </p>
        </div>
      </>
    );
  }

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (u) => {
    setEditing(u);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch {
      // El hook ya muestra toast con el mensaje del backend.
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isSeed) {
      toast.error("No se puede eliminar al super administrador principal");
      setDeleteTarget(null);
      return;
    }
    if (deleteTarget.id === currentUser.id) {
      toast.error("No puedes eliminar tu propia cuenta");
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // El hook ya muestra el toast de error.
    }
  };

  const columns = [
    {
      key: "user",
      label: "Usuario",
      render: (u) => {
        const roleInfo = getRoleInfo(u.role);
        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${roleInfo.color} text-sm font-black ${roleInfo.darkText ? "text-graphite-900" : "text-white"} shadow-md`}
            >
              {u.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-bold text-graphite-900">
                  {u.name}
                </span>
                {u.id === currentUser.id && (
                  <span className="rounded-full bg-maastel-100 px-2 py-0.5 text-[9px] font-bold uppercase text-maastel-700">
                    Tú
                  </span>
                )}
                {u.isSeed && (
                  <span
                    className="inline-flex items-center gap-0.5 rounded-full bg-maastel-100 px-2 py-0.5 text-[9px] font-bold uppercase text-maastel-700"
                    title="Super admin principal del sistema"
                  >
                    ⭐ Principal
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-gray-500">{u.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Rol",
      render: (u) => <RoleBadge role={u.role} size="md" />,
    },
    {
      key: "status",
      label: "Estado",
      render: (u) =>
        u.isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
            <Eye size={11} /> Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
            <EyeOff size={11} /> Inactivo
          </span>
        ),
    },
    {
      key: "actions",
      label: "Acciones",
      className: "w-32 text-right",
      cellClassName: "text-right",
      render: (u) => {
        const isSelf = u.id === currentUser.id;
        const isSeedUser = u.isSeed === true;
        const canDelete = !isSelf && !isSeedUser;
        const deleteTitle = isSeedUser
          ? "El super admin principal no se puede eliminar"
          : isSelf
            ? "No puedes eliminarte a ti mismo"
            : "Eliminar";

        return (
          <div className="flex justify-end gap-1">
            <button
              onClick={() => handleEdit(u)}
              className="rounded-lg p-2 text-maastel-600 transition hover:bg-maastel-50"
              title="Editar"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => canDelete && setDeleteTarget(u)}
              disabled={!canDelete}
              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              title={deleteTitle}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuarios del sistema"
        description="Administra los accesos al panel administrativo."
        action={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl"
          >
            <Plus size={16} />
            Nuevo usuario
          </button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </>
        ) : (
          <>
            <StatCard
              label="Total"
              value={stats.total}
              icon={UsersIcon}
              color="from-maastel-500 to-maastel-700"
            />
            <StatCard
              label="Super Admins"
              value={stats.superAdmins}
              icon={ShieldCheck}
              color="from-maastel-400 to-maastel-500"
              darkText
            />
            <StatCard
              label="Administradores"
              value={stats.admins}
              icon={Shield}
              color="from-emerald-500 to-emerald-700"
            />
            <StatCard
              label="Activos ahora"
              value={stats.active}
              icon={Eye}
              color="from-blue-500 to-blue-700"
              subtitle={`${stats.inactive} inactivos`}
            />
          </>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          Todos ({stats.total})
        </FilterPill>
        <FilterPill
          active={filter === "SUPER_ADMIN"}
          onClick={() => setFilter("SUPER_ADMIN")}
        >
          Super Admins ({stats.superAdmins})
        </FilterPill>
        <FilterPill
          active={filter === "ADMIN"}
          onClick={() => setFilter("ADMIN")}
        >
          Admins ({stats.admins})
        </FilterPill>
        <FilterPill
          active={filter === "INACTIVE"}
          onClick={() => setFilter("INACTIVE")}
        >
          Inactivos ({stats.inactive})
        </FilterPill>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Aún no hay usuarios"
          description="Crea el primer administrador para que pueda acceder al panel."
          primaryAction={{ label: "Crear usuario", onClick: handleCreate }}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Sin resultados"
          description="No hay usuarios que coincidan con este filtro."
          secondaryAction={{
            label: "Quitar filtro",
            onClick: () => setFilter("ALL"),
          }}
        />
      ) : (
        <DataTable columns={columns} data={filteredUsers} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar usuario" : "Crear nuevo usuario"}
        size="lg"
      >
        <UserForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`¿Seguro que quieres eliminar a "${deleteTarget?.name}"? Perderá acceso al panel y no se puede deshacer.`}
        confirmText="Sí, eliminar"
        loading={deleting}
      />
    </>
  );
}

function StatCard({ label, value, icon: Icon, color, darkText, subtitle }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {label}
          </div>
          <div className="mt-1 text-3xl font-black text-graphite-900">
            {value}
          </div>
          {subtitle && (
            <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-md ${darkText ? "text-graphite-900" : "text-white"}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${active ? "bg-maastel-700 text-white shadow-lg" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-maastel-300"}`}
    >
      {children}
    </button>
  );
}
