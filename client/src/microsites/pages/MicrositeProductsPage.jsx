import { useMicrosite } from "../MicrositeContext";
import { getMicrositeContent } from "../content";
import { ProductsCatalog } from "../../components/public/Products_components/ProductsCatalog";
import { CoverageMap } from "../../components/public/CoverageMap";
import { MicrositePageHeader } from "../components/MicrositePageHeader";

/**
 * Página de planes de Red MaasTel: lista de planes de internet +
 * mapa de cobertura. El filtrado por `planType` lo gestiona el catálogo.
 */
export function MicrositeProductsPage() {
    const { brandKey } = useMicrosite();
    const content = getMicrositeContent(brandKey);

    return (
        <section className="bg-gradient-to-b from-white via-maastel-50/30 to-white">
            <MicrositePageHeader
                chip={content.plans.chip}
                title={content.plans.title}
                subtitle={content.plans.subtitle}
            />
            <CoverageMap brand={brandKey} />
            <ProductsCatalog
                key={brandKey}
                brand={brandKey}
                title={null}
                subtitle={null}
            />
        </section>
    );
}
