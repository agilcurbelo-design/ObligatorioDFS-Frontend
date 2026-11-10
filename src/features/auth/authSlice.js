import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { iniciarSesion, registrarUsuario } from "./authApi";
import { getApiErrorMessage } from "../api/api";
import { obtenerUsuario } from "../usuarios/usuariosApi";

const normalizarCompras = (compras) =>
  compras.map((compra) => String(compra.videojuego?._id || compra.videojuego));

export const cargarComprasUsuario = createAsyncThunk(
  "auth/cargarComprasUsuario",
  async (id, { rejectWithValue }) => {
    try {
      const perfil = await obtenerUsuario(id);
      const compras = normalizarCompras(perfil.compras || []);
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      if (usuario?._id === id) {
        localStorage.setItem("usuario", JSON.stringify({ ...usuario, compras }));
      }
      return compras;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "No se pudieron cargar tus compras."));
    }
  },
  {
    condition: (_, { getState }) => {
      const { comprasStatus } = getState().auth;
      return comprasStatus !== "loading" && comprasStatus !== "succeeded";
    },
  },
);

const decodificarSub = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub;
  } catch {
    return null;
  }
};

const usuarioGuardado = () => {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
};

const tokenGuardado = localStorage.getItem("token");
const usuarioInicial = usuarioGuardado();

const normalizarSesion = (sesion) => ({
  ...sesion,
  usuario: { ...sesion.usuario, _id: decodificarSub(sesion.token) },
});

export const login = createAsyncThunk("auth/login", async (datos, { rejectWithValue }) => {
  try {
    const sesion = normalizarSesion(await iniciarSesion(datos));
    localStorage.setItem("token", sesion.token);
    localStorage.setItem("usuario", JSON.stringify(sesion.usuario));
    return sesion;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "No se pudo iniciar sesión."));
  }
});

export const register = createAsyncThunk("auth/register", async (datos, { rejectWithValue }) => {
  try {
    const sesion = normalizarSesion(await registrarUsuario(datos));
    localStorage.setItem("token", sesion.token);
    localStorage.setItem("usuario", JSON.stringify(sesion.usuario));
    return sesion;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "No se pudo crear la cuenta."));
  }
});

const sesionCerrada = (state) => {
  state.token = null;
  state.usuario = null;
  state.status = "idle";
  state.error = null;
  state.comprasStatus = "idle";
  state.comprasError = null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: tokenGuardado,
    usuario: tokenGuardado
      ? {
          ...(usuarioInicial || {}),
          _id: usuarioInicial?._id || decodificarSub(tokenGuardado),
          compras: Array.isArray(usuarioInicial?.compras) ? usuarioInicial.compras : null,
        }
      : null,
    status: "idle",
    error: null,
    comprasStatus: "idle",
    comprasError: null,
  },
  reducers: {
    sesionTerminada: sesionCerrada,
    limpiarErrorAuth: (state) => {
      state.error = null;
    },
    usuarioActualizado: (state, action) => {
      state.usuario = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.usuario = action.payload.usuario;
        state.status = "idle";
        state.comprasStatus = "idle";
        state.comprasError = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.usuario = action.payload.usuario;
        state.status = "idle";
        state.comprasStatus = "idle";
        state.comprasError = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })
      .addCase(cargarComprasUsuario.pending, (state) => {
        state.comprasStatus = "loading";
        state.comprasError = null;
      })
      .addCase(cargarComprasUsuario.fulfilled, (state, action) => {
        if (state.usuario?._id !== action.meta.arg) return;
        state.usuario.compras = action.payload;
        state.comprasStatus = "succeeded";
      })
      .addCase(cargarComprasUsuario.rejected, (state, action) => {
        state.comprasStatus = "failed";
        state.comprasError = action.payload || "No se pudieron cargar tus compras.";
      });
  },
});

export const cerrarSesion = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  dispatch(authSlice.actions.sesionTerminada());
};

export const actualizarUsuarioSesion = (datos) => (dispatch, getState) => {
  const usuario = { ...getState().auth.usuario, ...datos };
  localStorage.setItem("usuario", JSON.stringify(usuario));
  dispatch(authSlice.actions.usuarioActualizado(usuario));
};

export const { limpiarErrorAuth } = authSlice.actions;
export default authSlice.reducer;
