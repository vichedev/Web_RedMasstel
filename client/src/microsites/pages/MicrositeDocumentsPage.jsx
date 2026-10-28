import { useMemo } from "react";
import {
    FileText,
    Download,
    ExternalLink,
    ShieldCheck,
    Receipt,
    Scale,
    FileSignature,
    Files,
} from "lucide-react";
import { useActiveDocuments } from "../../hooks/useDocuments";
import { buildImageUrl } from "../../utils/imageUrl";
import { useMicrosite } from "../MicrositeContext";
import { getMicrositeContent } from "../content";
import { MicrositePageHeader } from "../components/MicrositePageHeader";

const CATEGORIES = [
    { key: "LEGAL", title: "Documentos legales", icon: Scale, accent: "from-maastel-500 to-maastel-700" },
    { key: "TARIFFS", title: "Tarifarios", icon: Receipt, accent: "from-emerald-500 to-emerald-700" },
    { key: "REGULATORY", title: "Normativa", icon: ShieldCheck, accent: "from-maastel-500 to-maastel-700" },
    { key: "CONTRACT", title: "Contratos", icon: FileSignature, accent: "from-amber-500 to-amber-700" },
    { key: "OTHER", title: "Otros documentos", icon: Files, accent: "from-maastel-700 to-maastel-500" },
];

function formatSize(bytes) {
    if (!bytes) return null;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Centro de documentos del microsite. Por ahora muestra todos los
 * documentos publicados (pendiente Fase 4 — filtro por marca cuando
 * el backend exponga `Document.brand`). El header sí toma el copy
 * del microsite activo, así que cada marca tiene su entrada propia.
 */
export function MicrositeDocumentsPage() {
    const { brandKey, brandName } = useMicrosite();
    const content = getMicrositeContent(brandKey);
    const { data: documents = [], isLoading } = useActiveDocuments(brandKey);

    const grouped = useMemo(() => {
        const out = {};
        for (const doc of documents) {
            const k = doc.category ?? "OTHER";
            if (!out[k]) out[k] = [];
            out[k].push(doc);
        }
        return out;
    }, [documents]);

    return (
        <>
            <MicrositePageHeader
                chip={content.documents.chip}
                title={content.documents.title}
                subtitle={content.documents.subtitle}
            />

            <section className="relative isolate overflow-hidden bg-white py-16">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(15,28,80,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,28,80,0.04)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]" />

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 animate-pulse rounded-2xl bg-gray-100"
                                />
                            ))}
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-maastel-50 text-maastel-600">
                                <FileText size={28} />
                            </div>
                            <h3 className="mt-4 text-xl font-black text-graphite-900">
                                Aún no hay documentos publicados
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                El equipo de {brandName} está preparando la documentación.
                                Vuelve pronto.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {CATEGORIES.map((cat) => {
                                const docs = grouped[cat.key] ?? [];
                                if (docs.length === 0) return null;
                                const Icon = cat.icon;
                                return (
                                    <section key={cat.key}>
                                        <header className="mb-5 flex items-center gap-3">
                                            <div
                                                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.accent} text-white shadow-lg`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-graphite-900">
                                                    {cat.title}
                                                </h2>
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                                                    {docs.length} documento
                                                    {docs.length === 1 ? "" : "s"}
                                                </p>
                                            </div>
                                        </header>

                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            {docs.map((doc) => (
                                                <DocumentCard
                                                    key={doc.id}
                                                    doc={doc}
                                                    accent={cat.accent}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

function DocumentCard({ doc, accent }) {
    const sizeLabel = formatSize(doc.fileSize);
    const fullUrl = buildImageUrl(doc.fileUrl);

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
            <span
                aria-hidden
                className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${accent}`}
            />

            <div className="flex items-start gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow`}
                >
                    <FileText size={20} />
                </div>
                <div className="min-w-0">
                    <h3 className="line-clamp-2 text-base font-black text-graphite-900 group-hover:text-maastel-700">
                        {doc.title}
                    </h3>
                    {doc.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {doc.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <span>PDF</span>
                {sizeLabel && (
                    <>
                        <span>·</span>
                        <span>{sizeLabel}</span>
                    </>
                )}
            </div>

            <div className="mt-4 flex gap-2">
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-maastel-700 transition hover:border-maastel-500 hover:bg-maastel-50"
                >
                    <ExternalLink size={13} />
                    Ver
                </a>
                <a
                    href={fullUrl}
                    download={doc.originalName ?? undefined}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${accent} px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow transition hover:shadow-lg`}
                >
                    <Download size={13} />
                    Descargar
                </a>
            </div>
        </article>
    );
}
