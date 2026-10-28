import api from "../api/axios";

export const emailConfigService = {
  findOne: async () => {
    const { data } = await api.get("/email-config");
    return data;
  },

  update: async (payload) => {
    const { data } = await api.patch("/email-config", payload);
    return data;
  },
};
