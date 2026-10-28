import api from "../api/axios";

export const promotionService = {
  // Público: para el hero de la landing (filtrable por microsite)
  findActive: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/promotions/active", { params });
    return data;
  },

  // Admin (filtrable por microsite)
  findAll: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/promotions", { params });
    return data;
  },

  findOne: async (id) => {
    const { data } = await api.get(`/promotions/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/promotions", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/promotions/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/promotions/${id}`);
  },

  reorder: async (items) => {
    const { data } = await api.patch("/promotions/reorder", { items });
    return data;
  },
};
