import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const RutaProtegida = ({ soloAdmin = false }) => {
  const { token, usuario } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  if (soloAdmin && usuario.rol !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
};

export default RutaProtegida;
