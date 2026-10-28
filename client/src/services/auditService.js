import api from "../api/axios";

export const auditService = {
  list: async (params = {}) => {
    const { data } = await api.get("/audit", { params });
    return data;
  },

  recent: async (limit = 20) => {
    const { data } = await api.get("/audit/recent", { params: { limit } });
    return data;
  },
};
