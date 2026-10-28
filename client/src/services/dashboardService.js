import api from "../api/axios";

export const dashboardService = {
  getStats: async () => {
    const { data } = await api.get("/dashboard/stats");
    return data;
  },
};
