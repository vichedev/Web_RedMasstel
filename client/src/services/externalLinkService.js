import api from "../api/axios";

export const externalLinkService = {
  findActive: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/external-links", { params });
    return data;
  },

  findFooter: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/external-links/footer", { params });
    return data;
  },

  findAllAdmin: async (brand) => {
    const params = brand ? { brand } : {};
    const { data } = await api.get("/external-links/admin", { params });
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/external-links", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/external-links/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/external-links/${id}`);
  },
};
