import api from "../api/api";

export const obtenerUsuario = async (id) => {
  const { data } = await api.get(`/usuarios/obtenerUsuario/${id}`);
  return data;
};

export const obtenerPuntos = async (id) => {
  const { data } = await api.get(`/usuarios/obtenerPuntos/${id}`);
  return data;
};

export const recomendarVideojuego = async (id) => {
  const { data } = await api.get(`/usuarios/recomendarVideojuego/${id}`);
  return data;
};

export const actualizarPerfil = async (id, datos) => {
  const { data } = await api.put(`/usuarios/modificarUsuario/${id}`, datos);
  return data;
};

export const cambiarPlanPremium = async (id) => {
  const { data } = await api.put(`/usuarios/cambiarPlan/${id}/plan`, { plan: "premium" });
  return data;
};

export const listarUsuarios = async () => {
  const { data } = await api.get("/usuarios/obtenerUsuarios");
  return data;
};
