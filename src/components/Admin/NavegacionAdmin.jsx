import { NavLink } from "react-router-dom";

const NavegacionAdmin = () => (
  <nav className="admin-nav" aria-label="Secciones de administración">
    <NavLink to="/admin/videojuegos">Videojuegos</NavLink>
    <NavLink to="/admin/categorias">Categorías</NavLink>
    <NavLink to="/admin/usuarios">Usuarios</NavLink>
  </nav>
);

export default NavegacionAdmin;
