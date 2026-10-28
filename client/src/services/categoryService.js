import api from "../api/axios";

export const categoryService = {
  findAll: async (onlyActive = false) => {
    const { data } = await api.get("/categories", {
      params: { onlyActive },
    });
    return data;
  },

  findOne: async (id) => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  create: async (category) => {
    const { data } = await api.post("/categories", category);
    return data;
  },

  update: async (id, category) => {
    const { data } = await api.patch(`/categories/${id}`, category);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/categories/${id}`);
  },

  findTree: async (onlyActive = false) => {
    const { data } = await api.get("/categories/tree", {
      params: { onlyActive },
    });
    return data;
  },

  move: async (id, payload) => {
    const { data } = await api.patch(`/categories/${id}/move`, payload);
    return data;
  },
};
