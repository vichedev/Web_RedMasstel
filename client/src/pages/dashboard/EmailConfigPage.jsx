import { useEffect, useState } from "react";
import {
  Mail,
  Key,
  ShieldCheck,
  AtSign,
  Inbox,
  Send,
  Save,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Skeleton } from "../../components/dashboard/Skeleton";
import {
  useEmailConfig,
  useUpdateEmailConfig,
} from "../../hooks/useEmailConfig";

const FIELDS = [
  {
    key: "publicKey",
    label: "Public Key",
    icon: Key,
    placeholder: "rSi0tSHMA4K-IaCA8",
    hint: "EmailJS → Account → API Keys → Public Key.",
    type: "text",
  },
  {
    key: "serviceId",
    label: "Service ID",
    icon: ShieldCheck,
    placeholder: "service_k7p7i7o",
    hint: "EmailJS → Email Services → ID del servicio.",
    type: "text",
  },
  {
    key: "templateContact",
    label: "Template — Formulario de contacto",
    icon: Inbox,
    placeholder: "template_xxxxxxx",
    hint: "Template usado por el formulario de la página /contacto.",
    type: "text",
  },
  {
    key: "templateSubscribe",
    label: "Template — Suscripción al newsletter",
    icon: Send,
    placeholder: "template_xxxxxxx",
    hint: "Template usado por la suscripción del footer.",
    type: "text",
  },
  {
    key: "adminEmail",
    label: "Email del administrador",
    icon: AtSign,
    placeholder: "ventas@redmaastel.ec",
    hint: "Variable {{admin_email}} disponible en los templates.",
    type: "email",
  },
];

const INITIAL_FORM = {
  publicKey: "",
  serviceId: "",
  templateContact: "",
  templateSubscribe: "",
  adminEmail: "",
};

export function EmailConfigPage() {
  const { data: config, isLoading } = useEmailConfig();
  const updateMut = useUpdateEmailConfig();

  const [form, setForm] = useState(INITIAL_FORM);
  const [dirty, setDirty] = useState(false);

  // Hidrata el form cuando llega la config (o cambia desde otro lado).
  useEffect(() => {
    if (!config || dirty) return;
    setForm({
      publicKey: config.publicKey ?? "",
      serviceId: config.serviceId ?? "",
      templateContact: config.templateContact ?? "",
      templateSubscribe: config.templateSubscribe ?? "",
      adminEmail: config.adminEmail ?? "",
    });
  }, [config, dirty]);

  const set = (key, value) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMut.mutateAsync({
        publicKey: form.publicKey.trim() || null,
        serviceId: form.serviceId.trim() || null,
        templateContact: form.templateContact.trim() || null,
        templateSubscribe: form.templateSubscribe.trim() || null,
        adminEmail: form.adminEmail.trim() || null,
      });
      setDirty(false);
    } catch {
      /* toast en hook */
    }
  };

  const isConfigured =
    !!config?.publicKey && !!config?.serviceId;
  const submitting = updateMut.isPending;

  return (
    <>
      <PageHeader
        title="EmailJS"
        description="Credenciales del servicio de correo (EmailJS) que usan el formulario de contacto y la suscripción al newsletter."
      />

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form principal */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 lg:col-span-2"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Mail size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Servicio de correo
                </div>
                <div className="truncate text-base font-black">
                  Configuración de EmailJS
                </div>
              </div>
              <span
                className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${isConfigured
                    ? "bg-emerald-400/30 text-white ring-emerald-200/50"
                    : "bg-amber-400/30 text-white ring-amber-200/50"
                  }`}
              >
                {isConfigured ? "Configurado" : "Pendiente"}
              </span>
            </div>

            <div className="space-y-5 p-5">
              {FIELDS.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key}>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <Icon size={12} className="text-maastel-600" />
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      autoComplete="off"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-sm text-gray-900 transition focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
                    />
                    {field.hint && (
                      <p className="mt-1 text-[11px] text-gray-500">{field.hint}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
              <span className="text-xs text-gray-500">
                {dirty ? "Cambios sin guardar" : "Sin cambios"}
              </span>
              <button
                type="submit"
                disabled={!dirty || submitting}
                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-4 py-2 text-sm font-black uppercase tracking-wider text-white shadow transition ${!dirty || submitting
                    ? "cursor-not-allowed opacity-50"
                    : "hover:shadow-lg"
                  }`}
              >
                <Save size={14} />
                {submitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>

          {/* Panel lateral: ayuda y enlaces */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-maastel-100 bg-maastel-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-maastel-700">
                <ExternalLink size={12} />
                Cómo obtener las credenciales
              </div>
              <ol className="space-y-2 text-sm text-graphite-900">
                <li className="flex gap-2">
                  <span className="font-black">1.</span>
                  <span>
                    Crea una cuenta gratuita en{" "}
                    <a
                      href="https://www.emailjs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline hover:text-maastel-600"
                    >
                      emailjs.com
                    </a>
                    .
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black">2.</span>
                  <span>
                    Conecta tu correo (Gmail, Outlook, etc.) en{" "}
                    <em>Email Services</em> y copia el <em>Service ID</em>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black">3.</span>
                  <span>
                    Crea dos templates en <em>Email Templates</em>: uno para
                    el formulario de contacto y otro para la suscripción.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black">4.</span>
                  <span>
                    Copia tu <em>Public Key</em> desde{" "}
                    <em>Account → API Keys</em>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-black">5.</span>
                  <span>
                    En EmailJS, restringe el dominio en{" "}
                    <em>Account → Security</em> al de tu sitio para evitar
                    abuso.
                  </span>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-2 text-amber-900">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div className="text-xs">
                  <strong className="font-black">Nota.</strong> El Public Key
                  de EmailJS se considera público por diseño y se expone al
                  navegador. La protección real viene del whitelist de
                  dominios en EmailJS.
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
