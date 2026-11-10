import api from "../api/api";

export const iniciarSesion = async (datos) => {
  const { data } = await api.post("/auth/login", datos);
  return data;
};

export const registrarUsuario = async (datos) => {
  const { data } = await api.post("/auth/register", datos);
  return data;
};
