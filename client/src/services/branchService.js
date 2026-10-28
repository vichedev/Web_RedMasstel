import api from "../api/axios";

export const branchService = {
  findAll: async (onlyActive = false) => {
    const { data } = await api.get("/branches", {
      params: { onlyActive },
    });
    return data;
  },

  findByBrand: async (brand) => {
    const { data } = await api.get(`/branches/${brand}`);
    return data;
  },

  update: async (brand, payload) => {
    const { data } = await api.patch(`/branches/${brand}`, payload);
    return data;
  },
};
