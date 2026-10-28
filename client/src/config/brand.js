/**
 * Configuración de la marca única **Red MaasTel** (ISP).
 *
 * Red MaasTel ofrece internet de fibra óptica y televisión por
 * suscripción bajo una sola identidad. La diferencia entre un plan de
 * internet y uno de TV la marca el `planType` del producto, no la marca.
 *
 * El número de WhatsApp se lee de las variables de entorno del frontend
 * (VITE_WHATSAPP_*) para que no haya teléfonos hardcoded en el bundle.
 */

// Quita todo lo que no sea dígito; wa.me sólo acepta E.164 sin "+".
function normalizePhone(raw) {
    if (!raw) return "";
    return String(raw).replace(/\D+/g, "");
}

const FALLBACK = normalizePhone(import.meta.env.VITE_WHATSAPP_DEFAULT);

const PHONES = {
    REDMAASTEL:
        normalizePhone(import.meta.env.VITE_WHATSAPP_REDMAASTEL) || FALLBACK,
};

export const BRANDS = {
    REDMAASTEL: {
        key: "REDMAASTEL",
        slug: "",
        name: "Red MaasTel",
        tagline: "Tu red de confianza",
        kind: "isp", // ofrece internet y TV
        ctaLabel: "Quiero este plan",
        accent: "from-maastel-500 to-maastel-700",
        accentSolid: "bg-maastel-600",
        accentText: "text-maastel-700",
        accentBorder: "border-maastel-200",
        tabActive: "bg-gradient-to-r from-maastel-500 to-maastel-700 text-white",
    },
};

export const BRAND_LIST = [BRANDS.REDMAASTEL];

export function getBrand() {
    return BRANDS.REDMAASTEL;
}

/**
 * Con marca única, cualquier slug resuelve a Red MaasTel. Se mantiene la
 * firma por compatibilidad con código que aún la invoque.
 */
export function getBrandBySlug() {
    return BRANDS.REDMAASTEL;
}

export function isInternetBrand() {
    // Red MaasTel ofrece internet (y TV); el storefront filtra por planType.
    return true;
}

/**
 * Sufijo de slot de branding. Con marca única ya no hay slots por marca;
 * devolvemos la clave para mantener la firma, pero los componentes caen
 * a los slots base (`NAVBAR_LOGO`, `HERO_LOGO`, `FOOTER_LOGO_MAIN`).
 */
export function brandSlotSuffix() {
    return "REDMAASTEL";
}

/**
 * Construye una ruta absoluta del sitio. Con marca única el sitio vive en
 * la raíz, así que devolvemos el subpath directo:
 *   brandHref('REDMAASTEL', '/nosotros') // → '/nosotros'
 *   brandHref('REDMAASTEL', '')          // → '/'
 */
export function brandHref(_brandKey, subpath = "") {
    if (!subpath) return "/";
    return subpath.startsWith("/") ? subpath : `/${subpath}`;
}

/**
 * Construye un enlace `https://wa.me/<num>?text=...` con un mensaje
 * contextual al plan. El tipo de mensaje (internet vs TV) se decide por
 * los campos del plan, no por la marca.
 *
 * `phoneOverride` permite al caller pasar el número de la sucursal cargada
 * desde la base de datos. Si no se pasa, cae al teléfono de `.env`.
 */
export function buildWhatsAppLink(brandKey, plan, phoneOverride) {
    const overridden = normalizePhone(phoneOverride);
    const phone = overridden || PHONES.REDMAASTEL;
    if (!phone) return null;

    const lines = [
        `Hola, me interesa el plan de Red MaasTel: *${plan?.name ?? ""}*.`,
    ];

    if (plan?.downloadSpeed) {
        const up = plan?.uploadSpeed ?? plan.downloadSpeed;
        lines.push(`Velocidad: ${plan.downloadSpeed}/${up} Mbps.`);
    } else if (plan?.channels) {
        const hd = plan?.hdChannels ? ` (${plan.hdChannels} en HD)` : "";
        lines.push(`Canales: ${plan.channels}${hd}.`);
    }

    if (plan?.price) {
        lines.push(`Precio: $${Number(plan.price).toFixed(2)} mensuales.`);
    }
    lines.push("¿Me pueden dar más información para contratarlo?");

    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${phone}?text=${text}`;
}
