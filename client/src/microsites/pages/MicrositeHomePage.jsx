import { MicrositeHero } from "../components/MicrositeHero";
import { BrandAbout } from "../components/BrandAbout";
import { useMicrosite } from "../MicrositeContext";
import { ProductsCatalog } from "../../components/public/Products_components/ProductsCatalog";
import { ContactSection } from "../../components/public/ContactSection";
import { AdBanner } from "../../components/public/AdBanner";

/**
 * Home del microsite. 100 % enfocado a la marca activa: no menciona
 * las otras dos. El BrandSwitcher de la barra superior es la única
 * forma de saltar entre microsites; aquí adentro todo habla solo de
 * esta marca.
 */
export function MicrositeHomePage() {
    const { brandKey } = useMicrosite();

    return (
        <>
            <MicrositeHero />
            <AdBanner position="HOME_TOP" />
            <BrandAbout />
            <ProductsCatalog
                key={brandKey}
                brand={brandKey}
                title="Planes destacados"
                subtitle="Conoce los planes disponibles."
            />
            <AdBanner position="HOME_MIDDLE" />
            <ContactSection />
        </>
    );
}
