import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  buscarEnCatalogo,
  crearVideojuego,
  eliminarVideojuego,
  listarVideojuegos,
} from "./videojuegosApi";
import { getApiErrorMessage } from "../api/api";

const obtenerError = (error, fallback) => getApiErrorMessage(error, fallback);

export const cargarVideojuegos = createAsyncThunk(
  "videojuegos/cargar",
  async ({ nombre = "", page = 1 } = {}, { rejectWithValue }) => {
    try {
      return nombre.trim()
        ? await buscarEnCatalogo(nombre.trim(), page)
        : await listarVideojuegos(page);
    } catch (error) {
      return rejectWithValue(obtenerError(error, "No se pudo cargar el catálogo."));
    }
  },
);

export const crearVideojuegoAdmin = createAsyncThunk(
  "videojuegos/crear",
  async (datos, { rejectWithValue }) => {
    try {
      return await crearVideojuego(datos);
    } catch (error) {
      return rejectWithValue(obtenerError(error, "No se pudo crear el videojuego."));
    }
  },
);

export const eliminarVideojuegoAdmin = createAsyncThunk(
  "videojuegos/eliminar",
  async (id, { rejectWithValue }) => {
    try {
      await eliminarVideojuego(id);
      return id;
    } catch (error) {
      return rejectWithValue(obtenerError(error, "No se pudo eliminar el videojuego."));
    }
  },
);

const videojuegosSlice = createSlice({
  name: "videojuegos",
  initialState: {
    items: [],
    pagination: { page: 1, total: 0, totalPages: 0 },
    status: "idle",
    error: null,
  },
  reducers: {
    limpiarErrorVideojuegos: (state) => {
      state.error = null;
    },
    actualizarVideojuegoLocal: (state, action) => {
      state.items = state.items.map((juego) =>
        juego._id === action.payload._id ? action.payload : juego,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarVideojuegos.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(cargarVideojuegos.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.videojuegos;
        state.pagination = action.payload.pagination;
      })
      .addCase(cargarVideojuegos.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })
      .addCase(crearVideojuegoAdmin.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items].slice(0, 10);
      })
      .addCase(eliminarVideojuegoAdmin.fulfilled, (state, action) => {
        state.items = state.items.filter((juego) => juego._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { limpiarErrorVideojuegos, actualizarVideojuegoLocal } = videojuegosSlice.actions;
export default videojuegosSlice.reducer;
