import { useMicrosite } from "../MicrositeContext";
import { getMicrositeContent } from "../content";
import { ContactSection } from "../../components/public/ContactSection";
import { MicrositePageHeader } from "../components/MicrositePageHeader";

export function MicrositeContactPage() {
    const { brandKey } = useMicrosite();
    const content = getMicrositeContent(brandKey);

    return (
        <>
            <MicrositePageHeader
                chip={content.contact.chip}
                title={content.contact.title}
                subtitle={content.contact.subtitle}
            />
            <ContactSection />
        </>
    );
}
