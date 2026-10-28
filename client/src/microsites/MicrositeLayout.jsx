import { Outlet } from "react-router-dom";
import { Navbar } from "../components/public/Navbar";
import { Footer } from "../components/public/Footer";
import { MicrositeProvider } from "./MicrositeContext";
import { CookieBanner } from "../components/public/CookieBanner";

/**
 * Shell común del sitio público de Red MaasTel. Envuelve el subárbol con
 * el `MicrositeProvider` (para que cualquier hijo lea la marca activa con
 * `useMicrosite()`), y pinta navbar + contenido de la ruta + footer.
 */
export function MicrositeLayout() {
    return (
        <MicrositeProvider>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
            <CookieBanner />
        </MicrositeProvider>
    );
}
