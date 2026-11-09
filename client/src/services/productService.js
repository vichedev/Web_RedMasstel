import api from "../api/axios";

export const productService = {
  // Público
  findAll: async (params = {}) => {
    const { data } = await api.get("/planes", { params });
    return data; // { items, meta }
  },

  findOne: async (id) => {
    const { data } = await api.get(`/planes/${id}`);
    return data;
  },

  // Admin
  findAllAdmin: async (filters = {}) => {
    const params = {};
    if (filters.brand) params.brand = filters.brand;
    if (filters.planType) params.planType = filters.planType;
    const { data } = await api.get("/planes/admin/all", { params });
    return data;
  },

  create: async (product) => {
    const { data } = await api.post("/planes", product);
    return data;
  },

  update: async (id, product) => {
    const { data } = await api.patch(`/planes/${id}`, product);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/planes/${id}`);
  },

  // ─── ACCIONES MASIVAS ───
  bulkUpdate: async (ids, patch) => {
    const { data } = await api.patch("/planes/bulk", { ids, patch });
    return data;
  },

  /** items: [{ id, displayOrder }] — posición de cada plan en la web. */
  reorder: async (items) => {
    const { data } = await api.patch("/planes/reorder", { items });
    return data;
  },

  bulkRemove: async (ids) => {
    const { data } = await api.delete("/planes/bulk", { data: { ids } });
    return data;
  },

  // ─── GALERÍA DE IMÁGENES ───
  listImages: async (productId) => {
    const { data } = await api.get(`/planes/${productId}/images`);
    return data;
  },

  addImage: async (productId, payload) => {
    const { data } = await api.post(`/planes/${productId}/images`, payload);
    return data;
  },

  updateImage: async (productId, imageId, payload) => {
    const { data } = await api.patch(
      `/planes/${productId}/images/${imageId}`,
      payload,
    );
    return data;
  },

  removeImage: async (productId, imageId) => {
    await api.delete(`/planes/${productId}/images/${imageId}`);
  },

  setPrimaryImage: async (productId, imageId) => {
    const { data } = await api.patch(
      `/planes/${productId}/images/${imageId}/primary`,
    );
    return data;
  },

  reorderImages: async (productId, items) => {
    const { data } = await api.patch(
      `/planes/${productId}/images/reorder`,
      { items },
    );
    return data;
  },
};
