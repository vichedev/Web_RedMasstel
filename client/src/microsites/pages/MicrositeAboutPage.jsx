import { BrandAbout } from "../components/BrandAbout";
import { useMicrosite } from "../MicrositeContext";
import { getMicrositeContent } from "../content";
import { MicrositePageHeader } from "../components/MicrositePageHeader";

export function MicrositeAboutPage() {
    const { brandKey } = useMicrosite();
    const content = getMicrositeContent(brandKey);

    return (
        <>
            <MicrositePageHeader
                chip={content.about.chip}
                title={content.about.title}
                subtitle={content.about.paragraphs[0]}
            />
            <BrandAbout />
        </>
    );
}
