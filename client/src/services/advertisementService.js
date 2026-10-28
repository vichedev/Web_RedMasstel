import api from "../api/axios";

export const advertisementService = {
  // Público (filtrable por posición + microsite)
  findActive: async (position, brand) => {
    const params = {};
    if (position) params.position = position;
    if (brand) params.brand = brand;
    const { data } = await api.get("/advertisements/active", { params });
    return data;
  },

  // Admin (filtrable por microsite)
  findAll: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/advertisements", { params });
    return data;
  },

  findOne: async (id) => {
    const { data } = await api.get(`/advertisements/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/advertisements", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/advertisements/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/advertisements/${id}`);
  },

  reorder: async (items) => {
    const { data } = await api.patch("/advertisements/reorder", { items });
    return data;
  },
};
