import api from "../api/api";

export const listarVideojuegos = async (page = 1) => {
  const { data } = await api.get("/videojuegos/listarVideojuegos", { params: { page } });
  return data;
};

export const buscarEnCatalogo = async (nombre, page = 1) => {
  const { data } = await api.get("/videojuegos/buscar/base-datos", { params: { nombre, page } });
  return data;
};

export const buscarEnRawg = async (nombre) => {
  const { data } = await api.get("/videojuegos/buscar/externo", { params: { nombre } });
  return data.resultados;
};

export const obtenerVideojuego = async (id) => {
  const { data } = await api.get(`/videojuegos/obtenerVideojuego/${id}`);
  return data;
};

export const crearVideojuego = async (datos) => {
  const { data } = await api.post("/videojuegos/crearVideojuego", datos);
  return data.videojuego;
};

export const actualizarVideojuego = async (id, datos) => {
  const { data } = await api.put(`/videojuegos/actualizarVideojuego/${id}`, datos);
  return data.videojuego;
};

export const eliminarVideojuego = async (id) => {
  const { data } = await api.delete(`/videojuegos/eliminarVideojuego/${id}`);
  return data;
};

export const comprarVideojuego = async (id, metodoPago) => {
  const { data } = await api.post(`/videojuegos/comprar/${id}`, { metodoPago });
  return data;
};

export const subirImagen = async (archivo) => {
  const formData = new FormData();
  formData.append("imagen", archivo);
  const { data } = await api.post("/uploads", formData);
  return data.url;
};
