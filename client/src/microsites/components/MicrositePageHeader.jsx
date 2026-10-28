import { useMicrosite } from "../MicrositeContext";

/**
 * Cabecera reutilizable para las páginas internas (Nosotros, Planes,
 * Documentos, Contacto). El chip usa el color de la marca Red MaasTel.
 */
const CHIP_THEME = {
    REDMAASTEL: "bg-maastel-100 text-maastel-700",
};

export function MicrositePageHeader({ chip, title, subtitle }) {
    const { brandKey } = useMicrosite();
    const chipClass = CHIP_THEME[brandKey] ?? CHIP_THEME.REDMAASTEL;

    return (
        <header className="bg-gradient-to-b from-maastel-50/40 to-white py-14">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                {chip && (
                    <div
                        className={`mb-3 inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${chipClass}`}
                    >
                        {chip}
                    </div>
                )}
                <h1 className="text-4xl font-black text-graphite-900 sm:text-5xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                        {subtitle}
                    </p>
                )}
            </div>
        </header>
    );
}
