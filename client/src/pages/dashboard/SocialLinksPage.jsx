import { useEffect, useMemo, useState } from "react";
import { Save, ExternalLink as ExtIcon, Plus, Trash2, Globe } from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Skeleton } from "../../components/dashboard/Skeleton";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import {
    FacebookIcon,
    InstagramIcon,
    TikTokIcon,
    XIcon,
    YoutubeIcon,
    LinkedInIcon,
} from "../../components/public/BrandIcons";
import {
    useAdminSocialLinks,
    useCreateSocialLink,
    useDeleteSocialLink,
    useUpdateSocialLink,
} from "../../hooks/useSocialLinks";

const PLATFORM_META = {
    FACEBOOK: {
        label: "Facebook",
        icon: FacebookIcon,
        accent: "from-[#1877F2] to-[#0d6ad7]",
        placeholder: "https://facebook.com/redmaastelec",
        hint: "URL completa del perfil/página de Facebook.",
    },
    INSTAGRAM: {
        label: "Instagram",
        icon: InstagramIcon,
        accent: "from-purple-500 via-pink-500 to-orange-400",
        placeholder: "https://instagram.com/redmaastelec",
        hint: "URL completa del perfil de Instagram.",
    },
    TIKTOK: {
        label: "TikTok",
        icon: TikTokIcon,
        accent: "from-gray-900 via-gray-800 to-gray-700",
        placeholder: "https://tiktok.com/@redmaastelec",
        hint: "URL completa del perfil de TikTok (@usuario).",
    },
    X: {
        label: "X (antes Twitter)",
        icon: XIcon,
        accent: "from-gray-900 to-black",
        placeholder: "https://x.com/redmaastelec",
        hint: "URL completa del perfil de X.",
    },
    YOUTUBE: {
        label: "YouTube",
        icon: YoutubeIcon,
        accent: "from-[#FF0000] to-[#cc0000]",
        placeholder: "https://youtube.com/@redmaastelec",
        hint: "URL del canal de YouTube.",
    },
    LINKEDIN: {
        label: "LinkedIn",
        icon: LinkedInIcon,
        accent: "from-[#0A66C2] to-[#004182]",
        placeholder: "https://linkedin.com/company/redmaastel",
        hint: "URL completa de la página de empresa o perfil.",
    },
};

const ALL_PLATFORMS = Object.keys(PLATFORM_META);

const BRAND_LABEL = {
    REDMAASTEL: "Red MaasTel",
};

/**
 * Página de redes sociales de Red MaasTel.
 *
 * El admin puede editar la URL de cualquier entrada, eliminarlas y crear
 * nuevas entradas para cualquier plataforma.
 */
export function SocialLinksPage({ brand }) {
    const { data: links = [], isLoading } = useAdminSocialLinks(brand);
    const updateMut = useUpdateSocialLink();
    const createMut = useCreateSocialLink();
    const deleteMut = useDeleteSocialLink();

    const [deleteTarget, setDeleteTarget] = useState(null);

    const platformsAvailableToAdd = useMemo(() => {
        // Si estamos en una marca, ofrecemos las plataformas que
        // aún no tienen una entrada propia para esa marca.
        if (!brand) return [];
        const taken = new Set(
            links.filter((l) => l.brand === brand).map((l) => l.platform),
        );
        return ALL_PLATFORMS.filter((p) => !taken.has(p));
    }, [links, brand]);

    const handleAdd = async (platform) => {
        try {
            await createMut.mutateAsync({
                platform,
                brand: brand ?? null,
                url: null,
                username: null,
                isActive: true,
            });
        } catch {
            /* toast */
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMut.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
        } catch {
            /* toast */
        }
    };

    const headerTitle = brand
        ? `Redes sociales · ${BRAND_LABEL[brand] ?? brand}`
        : "Redes sociales";
    const headerDescription = brand
        ? `Perfiles del microsite ${BRAND_LABEL[brand] ?? brand}. Las marcadas como globales se muestran también, pero no se pueden eliminar desde aquí.`
        : 'Configura las URLs de tus redes sociales. Las que tengan URL y estén activas aparecerán en el bloque "Síguenos" del footer.';

    return (
        <>
            <PageHeader title={headerTitle} description={headerDescription} />

            {brand && platformsAvailableToAdd.length > 0 && (
                <div className="mb-6 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Añadir plataforma propia para {BRAND_LABEL[brand]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {platformsAvailableToAdd.map((platform) => {
                            const meta = PLATFORM_META[platform];
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={platform}
                                    type="button"
                                    onClick={() => handleAdd(platform)}
                                    disabled={createMut.isPending}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:border-maastel-300 hover:bg-maastel-50 disabled:opacity-50"
                                >
                                    <Icon size={14} />
                                    <Plus size={12} />
                                    {meta.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                    ))}
                </div>
            ) : links.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
                    Aún no hay redes sociales configuradas
                    {brand ? ` para ${BRAND_LABEL[brand]}` : ""}.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {links.map((link) => (
                        <SocialCard
                            key={link.id}
                            link={link}
                            currentBrand={brand}
                            onSubmit={(payload) =>
                                updateMut.mutateAsync({ id: link.id, payload })
                            }
                            onDelete={() => setDeleteTarget(link)}
                            submitting={updateMut.isPending}
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Eliminar red social"
                message={`¿Eliminar la red ${PLATFORM_META[deleteTarget?.platform]?.label ?? ""
                    } de este microsite?`}
                confirmText="Sí, eliminar"
                loading={deleteMut.isPending}
            />
        </>
    );
}

function SocialCard({ link, currentBrand, onSubmit, onDelete, submitting }) {
    const meta = PLATFORM_META[link.platform] ?? {
        label: link.platform,
        icon: ExtIcon,
        accent: "from-maastel-500 to-maastel-700",
        placeholder: "https://...",
        hint: "",
    };
    const Icon = meta.icon;

    const [form, setForm] = useState({
        url: link.url ?? "",
        username: link.username ?? "",
        isActive: link.isActive ?? true,
    });
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (dirty) return;
        setForm({
            url: link.url ?? "",
            username: link.username ?? "",
            isActive: link.isActive ?? true,
        });
    }, [link, dirty]);

    const set = (key, value) => {
        setDirty(true);
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit({
                url: form.url.trim() || null,
                username: form.username.trim() || null,
                isActive: form.isActive,
            });
            setDirty(false);
        } catch {
            /* toast */
        }
    };

    const hasUrl = !!link.url;
    const isGlobal = !link.brand;
    // Sólo permitimos eliminar entradas específicas del microsite
    // que se está editando — las globales NO se borran desde aquí
    // para evitar que un admin elimine algo que afecta a las 3 marcas.
    const canDelete = currentBrand && link.brand === currentBrand;

    return (
        <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
        >
            <div
                className={`flex items-center gap-3 bg-gradient-to-r ${meta.accent} px-5 py-4 text-white`}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                        {isGlobal ? "Global" : BRAND_LABEL[link.brand] ?? link.brand}
                    </div>
                    <div className="truncate text-base font-black">{meta.label}</div>
                </div>
                <span
                    className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${hasUrl && link.isActive
                        ? "bg-emerald-400/30 text-white ring-emerald-200/50"
                        : "bg-amber-400/30 text-white ring-amber-200/50"
                        }`}
                >
                    {hasUrl && link.isActive
                        ? "En footer"
                        : hasUrl
                            ? "Inactivo"
                            : "Sin URL"}
                </span>
            </div>

            <div className="space-y-4 p-5">
                {isGlobal && currentBrand && (
                    <div className="flex items-start gap-2 rounded-lg bg-maastel-50 p-2.5 text-[11px] text-graphite-800">
                        <Globe size={13} className="mt-0.5 shrink-0" />
                        <span>
                            Esta entrada es global. Si quieres una distinta para{" "}
                            <strong>{BRAND_LABEL[currentBrand]}</strong>, usa el botón
                            "Añadir plataforma propia" arriba.
                        </span>
                    </div>
                )}
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                        URL del perfil
                    </label>
                    <input
                        type="url"
                        value={form.url}
                        onChange={(e) => set("url", e.target.value)}
                        placeholder={meta.placeholder}
                        maxLength={500}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 transition focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
                    />
                    <p className="mt-1 text-[11px] text-gray-500">{meta.hint}</p>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                        Usuario / handle (opcional)
                    </label>
                    <input
                        type="text"
                        value={form.username}
                        onChange={(e) => set("username", e.target.value)}
                        placeholder="@redmaastelec"
                        maxLength={120}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 transition focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => set("isActive", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
                    />
                    Mostrar en el footer
                </label>

                {form.url && (
                    <a
                        href={form.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-maastel-700 transition hover:text-graphite-900"
                    >
                        <ExtIcon size={11} />
                        Probar enlace
                    </a>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
                <div className="flex items-center gap-2">
                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50"
                            title="Eliminar"
                        >
                            <Trash2 size={12} />
                            Eliminar
                        </button>
                    )}
                    <span className="text-xs text-gray-500">
                        {dirty ? "Cambios sin guardar" : "Sin cambios"}
                    </span>
                </div>
                <button
                    type="submit"
                    disabled={!dirty || submitting}
                    className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${meta.accent} px-4 py-2 text-sm font-black uppercase tracking-wider text-white shadow transition ${!dirty || submitting
                        ? "cursor-not-allowed opacity-50"
                        : "hover:shadow-lg"
                        }`}
                >
                    <Save size={14} />
                    Guardar
                </button>
            </div>
        </form>
    );
}
