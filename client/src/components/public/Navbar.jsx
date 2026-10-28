import { Link, NavLink } from "react-router-dom";
import defaultLogo from "../../assets/logo-redmaastel.svg";
import { useBrandingMap } from "../../hooks/useBranding";
import { useMicrosite } from "../../microsites/MicrositeContext";
import { getMicrositeNav } from "../../microsites/content";
import { brandHref, brandSlotSuffix } from "../../config/brand";

/**
 * Navbar del sitio Red MaasTel.
 *
 * - El logo usa el slot `NAVBAR_LOGO` si el admin lo subió, y cae al
 *   logo por defecto del bundle si no hay ninguno.
 * - El CTA "Contratar ahora" apunta al contacto.
 */
export function Navbar() {
    const { brandKey, brandName } = useMicrosite();
    const { map } = useBrandingMap();

    const navItems = getMicrositeNav(brandKey);

    const brandSlot = `NAVBAR_LOGO_${brandSlotSuffix(brandKey)}`;
    const logoSrc =
        map[brandSlot]?.url ?? map.NAVBAR_LOGO?.url ?? defaultLogo;
    const logoAlt = map[brandSlot]?.alt ?? map.NAVBAR_LOGO?.alt ?? brandName;

    return (
        <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link
                    to={brandHref(brandKey)}
                    className="flex items-center"
                    aria-label={`${brandName} - Inicio`}
                >
                    <img
                        src={logoSrc}
                        alt={logoAlt}
                        className="h-12 w-auto object-contain sm:h-14"
                    />
                </Link>

                <div className="hidden items-center gap-8 text-sm font-semibold text-gray-700 lg:flex">
                    {navItems.map((item) => {
                        const to = brandHref(brandKey, item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={to}
                                end={item.path === ""}
                                className={({ isActive }) =>
                                    `relative transition hover:text-maastel-600 ${isActive ? "text-maastel-600" : ""
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {item.label}
                                        {isActive && (
                                            <span className="absolute -bottom-5 left-0 h-0.5 w-full bg-gradient-to-r from-maastel-500 to-maastel-700" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                <Link
                    to={brandHref(brandKey, "/contacto")}
                    className="hidden rounded-full bg-gradient-to-r from-maastel-500 to-maastel-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-maastel-500/30 transition hover:from-maastel-600 hover:to-maastel-700 hover:shadow-maastel-500/50 md:inline-block"
                >
                    Contratar ahora
                </Link>
            </div>
        </nav>
    );
}
