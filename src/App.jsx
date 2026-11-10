import { useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import "./App.css";
import "./estilos.css";
import { store } from "./store/store";
import Contenido from "./components/Contenido";
import RutaProtegida from "./components/Comun/RutaProtegida";
import LoginPage from "./features/auth/LoginPage";
import RegistroPage from "./features/auth/RegistroPage";
import CatalogoPage from "./features/videojuegos/CatalogoPage";
import DetalleVideojuegoPage from "./features/videojuegos/DetalleVideojuegoPage";
import AdminVideojuegosPage from "./features/videojuegos/AdminVideojuegosPage";
import AdminCategoriasPage from "./features/categorias/AdminCategoriasPage";
import AdminUsuariosPage from "./features/usuarios/AdminUsuariosPage";
import CuentaPage from "./features/usuarios/CuentaPage";
import Carrito from "./components/Comprar/Carrito";
import NavegacionAdmin from "./components/Admin/NavegacionAdmin";
import { cargarComprasUsuario, cerrarSesion } from "./features/auth/authSlice";
import { vaciarCarrito } from "./features/compras/carritoSlice";

const SesionListener = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const usuarioId = useSelector((state) => state.auth.usuario?._id);

  useEffect(() => {
    if (usuarioId) dispatch(cargarComprasUsuario(usuarioId));
  }, [dispatch, usuarioId]);

  useEffect(() => {
    const manejarExpiracion = () => {
      dispatch(cerrarSesion());
      dispatch(vaciarCarrito());
      navigate("/login", { replace: true, state: { mensaje: "Tu sesión expiró. Ingresá nuevamente." } });
    };
    window.addEventListener("session-expired", manejarExpiracion);
    return () => window.removeEventListener("session-expired", manejarExpiracion);
  }, [dispatch, navigate]);

  return null;
};

const PaginaNoEncontrada = () => (
  <section className="estado-vacio">
    <span>404</span>
    <h1>Este nivel no existe</h1>
    <p>La página que buscás no está disponible.</p>
    <Link className="boton boton--primario" to="/">Volver al inicio</Link>
  </section>
);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SesionListener />
        <Routes>
          <Route element={<Contenido />}>
            <Route index element={<CatalogoPage />} />
            <Route path="videojuegos/:id" element={<DetalleVideojuegoPage />} />
            <Route path="carrito" element={<Carrito />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegistroPage />} />
            <Route element={<RutaProtegida />}>
              <Route path="cuenta" element={<CuentaPage />} />
              <Route element={<RutaProtegida soloAdmin />}>
                <Route path="admin/videojuegos" element={<><NavegacionAdmin /><AdminVideojuegosPage /></>} />
                <Route path="admin/categorias" element={<><NavegacionAdmin /><AdminCategoriasPage /></>} />
                <Route path="admin/usuarios" element={<><NavegacionAdmin /><AdminUsuariosPage /></>} />
              </Route>
            </Route>
            <Route path="*" element={<PaginaNoEncontrada />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
