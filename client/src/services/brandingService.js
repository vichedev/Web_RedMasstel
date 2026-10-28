import api from "../api/axios";

export const brandingService = {
  findAll: async () => {
    const { data } = await api.get("/branding");
    return data;
  },

  findOne: async (slot) => {
    const { data } = await api.get(`/branding/${slot}`);
    return data;
  },

  update: async (slot, payload) => {
    const { data } = await api.patch(`/branding/${slot}`, payload);
    return data;
  },
};
