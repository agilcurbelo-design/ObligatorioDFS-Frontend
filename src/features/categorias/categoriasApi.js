import api from "../api/api";

export const listarCategorias = async () => {
  const { data } = await api.get("/categorias/obtenerCategorias");
  return data;
};

export const crearCategoria = async (datos) => {
  const { data } = await api.post("/categorias/crearCategoria", datos);
  return data;
};

export const actualizarCategoria = async (id, datos) => {
  const { data } = await api.put(`/categorias/modificarCategoria/${id}`, datos);
  return data;
};

export const eliminarCategoria = async (id) => {
  const { data } = await api.delete(`/categorias/eliminarCategoria/${id}`);
  return data;
};
