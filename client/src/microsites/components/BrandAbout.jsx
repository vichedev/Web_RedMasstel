import { useMicrosite } from "../MicrositeContext";
import { getMicrositeContent } from "../content";

/**
 * Sección "Sobre Red MaasTel". El chip y el lateral del card derecho
 * usan la paleta de la marca para mantener la identidad visual.
 */
const ABOUT_THEME = {
    REDMAASTEL: {
        chip: "bg-maastel-100 text-maastel-700",
        cardGradient: "from-graphite-900 via-graphite-800 to-graphite-950",
        cardOrbA: "bg-maastel-500/25",
        cardOrbB: "bg-maastel-400/20",
    },
};

export function BrandAbout() {
    const { brandKey } = useMicrosite();
    const content = getMicrositeContent(brandKey);
    const theme = ABOUT_THEME[brandKey] ?? ABOUT_THEME.REDMAASTEL;
    const Icon = content.icon;

    return (
        <section className="bg-gradient-to-b from-white via-maastel-50/30 to-white py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <div
                            className={`mb-3 inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${theme.chip}`}
                        >
                            {content.about.chip}
                        </div>
                        <h2 className="text-4xl font-black text-graphite-900 sm:text-5xl">
                            {content.about.title}
                        </h2>
                        <div className="mt-6 space-y-4">
                            {content.about.paragraphs.map((p, i) => (
                                <p
                                    key={i}
                                    className="text-base leading-relaxed text-gray-600"
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div
                            className={`relative overflow-hidden rounded-3xl border border-maastel-100 bg-gradient-to-br p-10 text-white shadow-2xl ${theme.cardGradient}`}
                        >
                            <div
                                className={`absolute -right-8 -top-8 h-40 w-40 rounded-full blur-2xl ${theme.cardOrbA}`}
                            />
                            <div
                                className={`absolute -bottom-10 -left-10 h-40 w-40 rounded-full blur-2xl ${theme.cardOrbB}`}
                            />

                            <div className="relative flex h-32 w-32 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                                <Icon size={56} strokeWidth={1.6} className="text-white" />
                            </div>

                            <p className="relative mt-6 text-xl font-black tracking-tight">
                                {content.chip}
                            </p>
                            <p className="relative mt-2 text-sm text-maastel-200">
                                {content.hero.subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
