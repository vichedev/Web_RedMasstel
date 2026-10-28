import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { MicrositeLayout } from "../microsites/MicrositeLayout";
import { MicrositeHomePage } from "../microsites/pages/MicrositeHomePage";
import { MicrositeAboutPage } from "../microsites/pages/MicrositeAboutPage";
import { MicrositeProductsPage } from "../microsites/pages/MicrositeProductsPage";
import { MicrositeDocumentsPage } from "../microsites/pages/MicrositeDocumentsPage";
import { MicrositeContactPage } from "../microsites/pages/MicrositeContactPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { ForcePasswordChangePage } from "../pages/auth/ForcePasswordChangePage";
import { DashboardHome } from "../pages/dashboard/DashboardHome";
import { ProductsPage } from "../pages/dashboard/ProductsPage";
import { CategoriesPage } from "../pages/dashboard/CategoriesPage";
import { UsersPage } from "../pages/dashboard/UsersPage";
import { PromotionsPage } from "../pages/dashboard/PromotionsPage";
import { AdvertisementsPage } from "../pages/dashboard/AdvertisementsPage";
import { BranchesPage } from "../pages/dashboard/BranchesPage";
import { BrandingPage } from "../pages/dashboard/BrandingPage";
import { DocumentsPage } from "../pages/dashboard/DocumentsPage";
import { ExternalLinksPage } from "../pages/dashboard/ExternalLinksPage";
import { SocialLinksPage } from "../pages/dashboard/SocialLinksPage";
import { EmailConfigPage } from "../pages/dashboard/EmailConfigPage";
import { ActivityPage } from "../pages/dashboard/ActivityPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ScrollToTop } from "../components/ScrollToTop";
import { ProfilePage } from "../pages/dashboard/ProfilePage";
import { CookiesPage } from "../pages/dashboard/CookiesPage";

/**
 * Mapa de rutas global (marca única Red MaasTel).
 *
 * Sitio público:
 *   - `/`        → home de Red MaasTel.
 *   - `/nosotros`, `/planes`, `/documentos`, `/contacto`.
 *
 * Dashboard admin:
 *   - `/dashboard`                 → resumen.
 *   - `/dashboard/{planes|sucursal|identidad|promociones|...}` → secciones.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Sitio público Red MaasTel (marca única, en la raíz) */}
        <Route path="/" element={<MicrositeLayout />}>
          <Route index element={<MicrositeHomePage />} />
          <Route path="nosotros" element={<MicrositeAboutPage />} />
          <Route path="planes" element={<MicrositeProductsPage />} />
          <Route path="documentos" element={<MicrositeDocumentsPage />} />
          <Route path="contacto" element={<MicrositeContactPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />

        {/* Atajo: /admin → panel (si no hay sesión, ProtectedRoute manda a /login) */}
        <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/must-change-password"
          element={
            <ProtectedRoute>
              <ForcePasswordChangePage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard admin */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />

          {/* ─── Secciones de Red MaasTel ───────────────────────── */}
          <Route path="planes" element={<ProductsPage />} />
          <Route path="sucursal" element={<BranchesPage brand="REDMAASTEL" />} />
          <Route path="identidad" element={<BrandingPage />} />
          <Route path="promociones" element={<PromotionsPage />} />
          <Route path="publicidad" element={<AdvertisementsPage />} />
          <Route path="documentos" element={<DocumentsPage />} />
          <Route path="enlaces" element={<ExternalLinksPage />} />
          <Route path="redes-sociales" element={<SocialLinksPage />} />
          <Route path="etiquetas" element={<CategoriesPage />} />
          <Route path="email" element={<EmailConfigPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="actividad" element={<ActivityPage />} />
          <Route path="cookies" element={<CookiesPage />} />
          <Route path="perfil" element={<ProfilePage />} />

          {/* Compatibilidad con rutas viejas (3 marcas) — redirige a las nuevas */}
          <Route path="cafanet/*" element={<Navigate to="/dashboard/planes" replace />} />
          <Route path="smart360/*" element={<Navigate to="/dashboard/planes" replace />} />
          <Route path="tv-cafa/*" element={<Navigate to="/dashboard/planes" replace />} />
          <Route path="sucursales" element={<Navigate to="/dashboard/sucursal" replace />} />
          <Route path="productos" element={<Navigate to="/dashboard/planes" replace />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center text-gray-500">
              404 — Página no encontrada
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
