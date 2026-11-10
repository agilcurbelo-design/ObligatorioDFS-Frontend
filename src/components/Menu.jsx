import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cerrarSesion } from "../features/auth/authSlice";
import { vaciarCarrito } from "../features/compras/carritoSlice";

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { usuario } = useSelector((state) => state.auth);
  const cantidadCarrito = useSelector((state) => state.carrito.length);

  const salir = () => {
    dispatch(cerrarSesion());
    dispatch(vaciarCarrito());
    navigate("/");
  };

  return (
    <header className="encabezado">
      <div className="encabezado__interior">
        <Link className="marca" to="/" aria-label="PixelPlay inicio">
          <span className="marca__icono">P</span>
          <span>pixel<span>play</span></span>
        </Link>
        <nav className="navegacion" aria-label="Navegación principal">
          <NavLink to="/" end>Explorar</NavLink>
          {usuario && <NavLink to="/cuenta">Mi cuenta</NavLink>}
          {usuario?.rol === "admin" && <NavLink to="/admin/videojuegos">Administración</NavLink>}
          <NavLink className="navegacion__carrito" to="/carrito">
            Carrito <span>{cantidadCarrito}</span>
          </NavLink>
        </nav>
        <div className="encabezado__usuario">
          {usuario ? (
            <>
              <span className="usuario-saludo">{usuario.username}</span>
              <button className="boton boton--texto" type="button" onClick={salir}>Salir</button>
            </>
          ) : (
            <>
              <Link className="boton boton--texto" to="/login">Ingresar</Link>
              <Link className="boton boton--primario boton--pequeno" to="/registro">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Menu;
