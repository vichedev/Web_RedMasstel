/**
 * Cobertura geográfica de Red MaasTel — Shushufindi, Sucumbíos, Ecuador.
 *
 * Cada zona tiene:
 *   - name:   nombre visible en el mapa y en la lista lateral
 *   - lat/lng: centro de la zona
 *   - radius: (opcional) radio en metros del área sombreada de cobertura
 *
 * Para agregar un barrio o parroquia nueva: busca el lugar en Google Maps,
 * clic derecho → copia las coordenadas y añádelo a PLACES y a COVERAGE.
 */

const PLACES = {
    shushufindi: {
        name: "Shushufindi (casco urbano)",
        lat: -0.1866,
        lng: -76.6466,
        radius: 1900,
    },
};

export const COVERAGE = {
    REDMAASTEL: [PLACES.shushufindi],
};

/** Centro y zoom por defecto del mapa (Shushufindi). */
export const COVERAGE_DEFAULT_VIEW = {
    center: [-0.1866, -76.6466],
    zoom: 14,
};

/**
 * Color del marker en el mapa. Se usan los hex directos en lugar de
 * clases Tailwind porque el HTML del divIcon de Leaflet vive fuera del
 * scope de la build de Tailwind.
 */
export const COVERAGE_COLORS = {
    REDMAASTEL: { fill: "#ed7d2b", ring: "rgba(237, 125, 43, 0.45)" },
};
