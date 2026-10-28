import api from "../api/axios";

export const cookieConsentService = {
  record: async ({ visitorId, decision }) => {
    const { data } = await api.post("/cookie-consent", { visitorId, decision });
    return data;
  },

  stats: async () => {
    const { data } = await api.get("/cookie-consent/stats");
    return data;
  },
};
