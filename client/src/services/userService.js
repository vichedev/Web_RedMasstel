import api from "../api/axios";

export const userService = {
  /**
   * Devuelve directamente el array de usuarios para la UI.
   * El backend responde { items, meta } — si quieres paginar a futuro,
   * usa `findPaginated` en su lugar.
   */
  findAll: async () => {
    const { data } = await api.get("/users", { params: { limit: 100 } });
    if (Array.isArray(data)) return data; // tolerancia con respuestas antiguas
    return data?.items ?? [];
  },

  findPaginated: async (params = {}) => {
    const { data } = await api.get("/users", { params });
    return data;
  },

  findOne: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (user) => {
    const { data } = await api.post("/users", user);
    return data;
  },

  update: async (id, user) => {
    const { data } = await api.patch(`/users/${id}`, user);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/users/${id}`);
  },
};
