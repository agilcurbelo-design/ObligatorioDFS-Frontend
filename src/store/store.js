import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import videojuegosReducer from "../features/videojuegos/videojuegosSlice";
import carritoReducer from "../features/compras/carritoSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videojuegos: videojuegosReducer,
    carrito: carritoReducer,
  },
});

let carritoPersistido = store.getState().carrito;
store.subscribe(() => {
  const carritoActual = store.getState().carrito;
  if (carritoActual !== carritoPersistido) {
    if (carritoActual.length) {
      sessionStorage.setItem("carrito", JSON.stringify(carritoActual));
    } else {
      sessionStorage.removeItem("carrito");
    }
    carritoPersistido = carritoActual;
  }
});