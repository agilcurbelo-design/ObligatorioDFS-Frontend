import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Aviso from "../Comun/Aviso";
import { comprarVideojuego } from "../../features/videojuegos/videojuegosApi";
import {
  actualizarUsuarioSesion,
  cargarComprasUsuario,
} from "../../features/auth/authSlice";
import { obtenerComprasRestantes } from "../../features/compras/carritoSlice";

const Comprar = ({ videojuego, onCompra, bloqueado = false }) => {
  const dispatch = useDispatch();
  const { usuario, comprasStatus } = useSelector((state) => state.auth);
  const [metodoPago, setMetodoPago] = useState("dinero");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const esPlus = usuario?.plan === "plus";
  const restantes = obtenerComprasRestantes(usuario);
  const comprasValidadas = comprasStatus === "succeeded" && Array.isArray(usuario?.compras);
  const yaComprado = comprasValidadas && usuario.compras.includes(String(videojuego._id));
  const limiteAlcanzado = esPlus && comprasValidadas && restantes === 0;
  const compraBloqueada = bloqueado || yaComprado || limiteAlcanzado || (esPlus && !comprasValidadas);

  const confirmarCompra = async () => {
    if (!usuario) return;
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const resultado = await comprarVideojuego(videojuego._id, metodoPago);
      const comprasActualizadas = comprasValidadas
        ? [...usuario.compras, String(resultado.compra.videojuego)]
        : usuario.compras;
      dispatch(actualizarUsuarioSesion({ puntos: resultado.puntos, compras: comprasActualizadas }));
      if (!comprasValidadas) dispatch(cargarComprasUsuario(usuario._id));
      setMensaje(resultado.message || "Compra registrada correctamente.");
      onCompra?.(videojuego._id);
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudo completar la compra.");
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="compra-requiere-login">
        <p>Ingresá para comprar este videojuego.</p>
        <Link className="boton boton--primario" to="/login">Ingresar</Link>
      </div>
    );
  }

  return (
    <div className="compra-form">
      {error && <Aviso>{error}</Aviso>}
      {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}
      {esPlus && (
        <p className="compra-restantes">
          {comprasValidadas
            ? `Te quedan ${restantes} de 10 compras.`
            : "Verificando tus compras disponibles..."}
        </p>
      )}
      {yaComprado && <Aviso>Ya compraste este videojuego.</Aviso>}
      {bloqueado && <Aviso>No te quedan compras disponibles para este videojuego en tu carrito.</Aviso>}
      {limiteAlcanzado && <Aviso>Alcanzaste el límite de 10 compras del plan Plus.</Aviso>}
      <label htmlFor={`metodo-${videojuego._id}`}>Método de pago</label>
      <select
        id={`metodo-${videojuego._id}`}
        value={metodoPago}
        onChange={(event) => setMetodoPago(event.target.value)}
        disabled={cargando}
      >
        <option value="dinero">Dinero</option>
        {usuario.plan === "premium" && <option value="puntos">Puntos</option>}
      </select>
      {metodoPago === "puntos" && (
        <small>Se debitan aproximadamente {Math.round(videojuego.precio * 100)} puntos.</small>
      )}
      <button className="boton boton--primario" type="button" disabled={cargando || compraBloqueada} onClick={confirmarCompra}>
        {cargando
          ? "Procesando..."
          : yaComprado
            ? "Ya comprado"
            : compraBloqueada
              ? "Sin compras disponibles"
              : "Comprar ahora"}
      </button>
    </div>
  );
};

export default Comprar;