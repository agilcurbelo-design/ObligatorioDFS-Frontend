import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  agregarVideojuegoAlCarrito,
  obtenerComprasRestantes,
} from "../../features/compras/carritoSlice";
import Aviso from "../Comun/Aviso";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(valor || 0);

const TarjetaVideojuego = ({ videojuego }) => {
  const dispatch = useDispatch();
  const { carrito, auth } = useSelector((state) => ({
    carrito: state.carrito,
    auth: state.auth,
  }));
  const [aviso, setAviso] = useState("");
  const agregado = carrito.some((juego) => juego._id === videojuego._id);
  const compras = auth.usuario?.compras;
  const esPlus = auth.usuario?.plan === "plus";
  const yaComprado = Array.isArray(compras) && compras.includes(String(videojuego._id));
  const carritosPendientes = Array.isArray(compras)
    ? carrito.filter((juego) => !compras.includes(String(juego._id))).length
    : 0;
  const restantes = obtenerComprasRestantes(auth.usuario);
  const limiteCarritoAlcanzado = esPlus && carritosPendientes >= restantes;
  const validandoCompras = esPlus && auth.comprasStatus !== "succeeded";
  const agregar = () => {
    const resultado = dispatch(agregarVideojuegoAlCarrito(videojuego));
    setAviso(
      resultado.agregado
        ? ""
        : resultado.motivo === "comprado"
          ? "Ya compraste este videojuego."
          : resultado.motivo === "validando"
            ? "Estamos verificando tus compras. Probá de nuevo en unos segundos."
            : "No podés agregar más videojuegos que las compras disponibles de tu plan.",
    );
  };

  return (
    <article className="juego-card">
      <Link
        to={`/videojuegos/${videojuego._id}`}
        className="juego-card__imagen"
        aria-label={`Ver ${videojuego.nombre}`}
      >
        {videojuego.imagen ? (
          <img src={videojuego.imagen} alt="" loading="lazy" />
        ) : (
          <span className="juego-card__sin-imagen">PixelPlay</span>
        )}
        {videojuego.puntajeMetacritic != null && (
          <span className="juego-card__puntaje">{videojuego.puntajeMetacritic}</span>
        )}
      </Link>
      {aviso && <Aviso>{aviso}</Aviso>}
      <div className="juego-card__contenido">
        <div className="juego-card__meta">
          <span>{videojuego.categoria?.nombre || "Videojuego"}</span>
          <strong>{formatoPrecio(videojuego.precio)}</strong>
        </div>
        <h2>
          <Link to={`/videojuegos/${videojuego._id}`}>{videojuego.nombre}</Link>
        </h2>
        <p>{videojuego.descripcion || "Descubrí más sobre este juego."}</p>
        <div className="juego-card__acciones">
          <Link className="boton boton--secundario" to={`/videojuegos/${videojuego._id}`}>
            Ver detalle
          </Link>
          <button
            className="boton boton--primario"
            type="button"
            disabled={agregado || yaComprado || validandoCompras || (esPlus && restantes === 0) || limiteCarritoAlcanzado}
            onClick={agregar}
          >
            {agregado
              ? "En el carrito"
              : yaComprado
                ? "Ya comprado"
                : validandoCompras
                  ? "Verificando..."
                  : esPlus && restantes === 0
                    ? "Límite alcanzado"
                    : limiteCarritoAlcanzado
                      ? "Límite en carrito"
                      : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default TarjetaVideojuego;
