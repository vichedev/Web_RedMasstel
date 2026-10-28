import api from "../api/axios";

export const socialLinkService = {
  // Público: sólo activos con URL (filtrable por microsite)
  findPublic: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/social-links", { params });
    return data;
  },

  // Admin: lista completa (filtrable por microsite)
  findAllAdmin: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/social-links/admin", { params });
    return data;
  },

  findOne: async (id) => {
    const { data } = await api.get(`/social-links/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/social-links", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/social-links/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/social-links/${id}`);
  },
};
