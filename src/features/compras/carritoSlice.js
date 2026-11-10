import { createSlice } from "@reduxjs/toolkit";

export const LIMITE_COMPRAS_PLUS = 10;

export const obtenerComprasRestantes = (usuario) =>
  Math.max(0, LIMITE_COMPRAS_PLUS - (usuario?.compras?.length || 0));

const carritoGuardado = () => {
  try {
    const carrito = JSON.parse(sessionStorage.getItem("carrito") || "[]");
    return Array.isArray(carrito) ? carrito : [];
  } catch {
    return [];
  }
};

const carritoSlice = createSlice({
  name: "carrito",
  initialState: carritoGuardado(),
  reducers: {
    agregarAlCarrito: (state, action) => {
      if (!state.some((juego) => juego._id === action.payload._id)) {
        state.push(action.payload);
      }
    },
    quitarDelCarrito: (state, action) => {
      return state.filter((juego) => juego._id !== action.payload);
    },
    vaciarCarrito: () => [],
  },
});

export const agregarVideojuegoAlCarrito = (videojuego) => (dispatch, getState) => {
  const { auth, carrito } = getState();
  const { usuario, comprasStatus } = auth;
  const id = String(videojuego._id);
  const compras = usuario?.compras;

  if (carrito.some((juego) => juego._id === videojuego._id)) {
    return { agregado: false, motivo: "carrito" };
  }
  if (!usuario || usuario.plan === "premium") {
    dispatch(carritoSlice.actions.agregarAlCarrito(videojuego));
    return { agregado: true };
  }
  if (comprasStatus !== "succeeded" || !Array.isArray(compras)) {
    return { agregado: false, motivo: "validando" };
  }
  if (compras.includes(id)) {
    return { agregado: false, motivo: "comprado" };
  }

  const restantes = obtenerComprasRestantes(usuario);
  const pendientes = carrito.filter((juego) => !compras.includes(String(juego._id))).length;
  if (pendientes >= restantes) {
    return { agregado: false, motivo: "limite" };
  }

  dispatch(carritoSlice.actions.agregarAlCarrito(videojuego));
  return { agregado: true };
};

export const { quitarDelCarrito, vaciarCarrito } = carritoSlice.actions;
export default carritoSlice.reducer;
