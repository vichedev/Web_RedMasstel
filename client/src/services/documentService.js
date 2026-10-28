import api from "../api/axios";

/**
 * Helper para no repetir el armado del query string. Si `brand` es
 * `null`/`undefined`/vacío, no agrega el parámetro y el backend
 * devuelve todos los documentos (vista global).
 */
function withBrand(path, brand) {
  if (!brand) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}brand=${encodeURIComponent(brand)}`;
}

export const documentService = {
  // Público
  findActive: async (brand) => {
    const { data } = await api.get(withBrand("/documents", brand));
    return data;
  },

  findFooter: async (brand) => {
    const { data } = await api.get(withBrand("/documents/footer", brand));
    return data;
  },

  // Admin
  findAllAdmin: async (brand) => {
    const { data } = await api.get(withBrand("/documents/admin", brand));
    return data;
  },

  findOne: async (id) => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/documents", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/documents/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    await api.delete(`/documents/${id}`);
  },
};
