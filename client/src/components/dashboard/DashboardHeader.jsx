import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  ExternalLink,
  Search,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);
}

function dispatchOpenPalette() {
  const e = new KeyboardEvent("keydown", {
    key: "k",
    ctrlKey: !isMac(),
    metaKey: isMac(),
    bubbles: true,
  });
  window.dispatchEvent(e);
}

export function DashboardHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Panel administrativo
            </div>
            <div className="text-lg font-black text-graphite-900">Dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={dispatchOpenPalette}
            className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 transition hover:border-maastel-500 hover:text-maastel-600 md:inline-flex"
            title="Abrir búsqueda global"
          >
            <Search size={14} />
            <span className="text-gray-400">Buscar...</span>
            <kbd className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
              {isMac() ? "⌘K" : "Ctrl+K"}
            </kbd>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-maastel-500 hover:text-maastel-600 sm:inline-flex"
          >
            Ver sitio
            <ExternalLink size={14} />
          </a>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-maastel-500"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-maastel-600 to-graphite-800 text-sm font-black text-maastel-400">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-bold text-graphite-900">
                  {user?.name}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">
                  {user?.role}
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`transition ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="text-sm font-bold text-graphite-900">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/dashboard/perfil");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <User size={15} />
                  Mi perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
