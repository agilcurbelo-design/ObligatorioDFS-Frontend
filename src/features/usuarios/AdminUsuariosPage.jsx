import { useEffect, useState } from "react";
import Aviso from "../../components/Comun/Aviso";
import Cargando from "../../components/Comun/Cargando";
import { listarUsuarios } from "./usuariosApi";

const AdminUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listarUsuarios()
      .then(setUsuarios)
      .catch((fallo) => setError(fallo.response?.data?.message || "No se pudieron cargar los usuarios."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="admin-pagina">
      <div className="seccion-titulo">
        <div><p className="eyebrow">Herramientas de administración</p><h1>Usuarios</h1></div>
        <span className="resultado-total">{usuarios.length} cuentas</span>
      </div>
      {error && <Aviso>{error}</Aviso>}
      {cargando && <Cargando texto="Cargando usuarios..." />}
      {!cargando && usuarios.length === 0 && !error && <p className="campo-ayuda">No hay usuarios registrados.</p>}
      {!cargando && usuarios.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla-admin">
            <thead>
              <tr><th>Usuario</th><th>Rol</th><th>Plan</th><th>Puntos</th><th>Compras</th></tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario._id}>
                  <td>{usuario.username}</td>
                  <td><span className="estado-etiqueta">{usuario.rol}</span></td>
                  <td>{usuario.plan}</td>
                  <td>{new Intl.NumberFormat("es-UY").format(usuario.puntos || 0)}</td>
                  <td>{usuario.compras?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminUsuariosPage;
