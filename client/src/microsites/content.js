/**
 * Contenido editorial del sitio **Red MaasTel**. Aquí se concentra todo
 * lo **textual** del sitio (titulares del hero, misión/visión, CTAs,
 * navegación). Los componentes de UI leen su copy de aquí.
 *
 * Para cambiar el discurso del sitio NO hay que tocar JSX: basta con
 * editar el bloque `REDMAASTEL` de este archivo.
 */

import { Wifi } from "lucide-react";

export const MICROSITE_NAV = {
    REDMAASTEL: [
        { label: "Inicio", path: "" },
        { label: "Nosotros", path: "/nosotros" },
        { label: "Planes", path: "/planes" },
        { label: "Documentos", path: "/documentos" },
        { label: "Contacto", path: "/contacto" },
    ],
};

export const MICROSITE_CONTENT = {
    REDMAASTEL: {
        icon: Wifi,
        chip: "Internet de fibra óptica",
        hero: {
            title: "Conéctate con la red",
            highlight: "de confianza",
            tail: "",
            subtitle:
                "Internet de fibra óptica de alta velocidad para tu hogar y tu negocio. Red MaasTel: estabilidad, soporte 24/7 y la mejor cobertura.",
            ctaPrimary: { label: "Ver planes", to: "/planes" },
            ctaSecondary: { label: "Hablar con un asesor", to: "/contacto" },
            // Stats que aparecen como cards al pie del hero. `value` es el
            // número/etiqueta destacada y `label` la descripción corta.
            features: [
                { value: "1 Gbps", label: "Velocidad máxima" },
                { value: "Wi-Fi 6", label: "Tecnología incluida" },
                { value: "24/7", label: "Soporte técnico" },
                { value: "Simétrica", label: "Subida y bajada" },
            ],
        },
        about: {
            chip: "Nuestra misión",
            title: "Tu red de confianza, sin límites",
            paragraphs: [
                "En Red MaasTel proporcionamos internet de fibra óptica con máxima estabilidad y velocidad simétrica, pensado para familias y empresas que necesitan una conexión real.",
                "Cubrimos zonas rurales y urbanas con la misma calidad, expandiendo nuestra red continuamente con la mejor tecnología y una atención personalizada.",
            ],
        },
        plans: {
            chip: "Planes Red MaasTel",
            title: "Elige el plan que se adapta a ti",
            subtitle:
                "Desde Wi-Fi 6 para el hogar hasta fibra dedicada para tu empresa.",
        },
        documents: {
            chip: "Documentos Red MaasTel",
            title: "Contratos, condiciones y guías",
            subtitle:
                "Toda la documentación de los planes y las políticas del servicio.",
        },
        contact: {
            chip: "Conversemos",
            title: "Te asesoramos sobre el plan ideal",
            subtitle:
                "Cuéntanos qué necesitas: velocidad para tu hogar o fibra para tu negocio. Te recomendamos la mejor opción.",
        },
    },
};

export function getMicrositeContent() {
    return MICROSITE_CONTENT.REDMAASTEL;
}

export function getMicrositeNav() {
    return MICROSITE_NAV.REDMAASTEL;
}
