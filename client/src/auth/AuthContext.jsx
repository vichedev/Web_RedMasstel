import { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { AUTH_EXPIRED_EVENT } from "../api/axios";

export const AuthContext = createContext(null);

/**
 * Provider de autenticación.
 *
 * No guardamos tokens en localStorage: la sesión vive en una cookie httpOnly
 * que el backend setea al hacer login. Al boot pedimos `/auth/me` para
 * recuperar el usuario si la cookie sigue siendo válida.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hidrata el usuario al montar.
  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Si axios detecta 401 fuera del login, limpia el usuario.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email, password, totpCode) => {
    const fn = totpCode
      ? () => authService.loginWithTotp(email, password, totpCode)
      : () => authService.login(email, password);
    const { user: userData } = await fn();
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
