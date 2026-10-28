import { Link } from "react-router-dom";

/**
 * Botón / link con look "magnético" — el original aplicaba un efecto de
 * atracción al cursor; aquí mantenemos solo el wrapper para que los
 * slides existentes sigan funcionando sin reescribirlos. Si `href`
 * empieza con `/`, usamos `<Link>` para no recargar la SPA; en otro
 * caso renderizamos un `<a>` (enlaces externos / ancla).
 */
export function MagneticButton({ href, children, className = "", ...rest }) {
    const isInternal = typeof href === "string" && href.startsWith("/");

    if (isInternal) {
        return (
            <Link to={href} className={className} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <a href={href} className={className} {...rest}>
            {children}
        </a>
    );
}
