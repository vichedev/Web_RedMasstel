import { createContext, useContext, useMemo } from "react";
import { getBrand } from "../config/brand";

/**
 * Contexto del sitio público. Con marca única (Red MaasTel) el provider
 * siempre expone la misma marca; se conserva el hook `useMicrosite()`
 * para que los componentes que lo consumen sigan funcionando sin cambios.
 */
const MicrositeContext = createContext(null);

export function MicrositeProvider({ children }) {
    const value = useMemo(() => {
        const brand = getBrand();
        return {
            brand,
            brandKey: brand.key,
            brandSlug: brand.slug,
            brandName: brand.name,
            isUnknown: false,
        };
    }, []);

    return (
        <MicrositeContext.Provider value={value}>
            {children}
        </MicrositeContext.Provider>
    );
}

/**
 * Hook que devuelve la marca activa. Lanza error si se llama fuera de un
 * `<MicrositeProvider />` para detectar a tiempo componentes mal ubicados.
 */
export function useMicrosite() {
    const ctx = useContext(MicrositeContext);
    if (!ctx) {
        throw new Error(
            "useMicrosite() debe usarse dentro de <MicrositeProvider />",
        );
    }
    return ctx;
}
