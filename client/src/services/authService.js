import api from "../api/axios";

export const authService = {
  login: async (email, password) => {
    // Backend setea cookie httpOnly y devuelve { user }.
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Aunque el backend falle, el cliente debe limpiar su estado igualmente.
    }
  },

  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // Alias retro-compatible
  profile: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  updateProfile: async (updates) => {
    const { data } = await api.patch("/auth/profile", updates);
    return data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const { data } = await api.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return data;
  },

  // ─── 2FA ───
  setup2fa: async () => {
    const { data } = await api.post("/auth/2fa/setup");
    return data; // { otpauthUrl, qrDataUrl }
  },

  verify2fa: async (token) => {
    const { data } = await api.post("/auth/2fa/verify", { token });
    return data;
  },

  disable2fa: async (token) => {
    const { data } = await api.post("/auth/2fa/disable", { token });
    return data;
  },

  loginWithTotp: async (email, password, totpCode) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
      totpCode,
    });
    return data;
  },
};
