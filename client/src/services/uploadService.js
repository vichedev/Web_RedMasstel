import api from "../api/axios";

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data; // { filename, url, size, mimetype }
  },

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/uploads/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data; // { filename, url, size, mimetype, originalName }
  },
};
