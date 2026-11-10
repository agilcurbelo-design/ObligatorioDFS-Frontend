import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerVideojuego } from "./videojuegosApi";
import Cargando from "../../components/Comun/Cargando";
import Aviso from "../../components/Comun/Aviso";
import Comprar from "../../components/Comprar/Comprar";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(valor || 0);

const DetalleVideojuegoPage = () => {
  const { id } = useParams();
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerVideojuego(id)
      .then((videojuego) => { if (activo) setResultado({ id, videojuego }); })
      .catch((fallo) => {
        if (activo) {
          setResultado({
            id,
            error: fallo.response?.data?.message || "No se pudo cargar el videojuego.",
          });
        }
      });
    return () => { activo = false; };
  }, [id]);

  if (resultado?.id !== id) return <Cargando texto="Cargando videojuego..." />;
  const { videojuego, error } = resultado;
  if (error || !videojuego) {
    return (
      <section className="estado-vacio">
        <Aviso>{error || "No encontramos ese videojuego."}</Aviso>
        <Link className="boton boton--secundario" to="/">Volver al catálogo</Link>
      </section>
    );
  }

  return (
    <section className="detalle-juego">
      <Link to="/" className="volver-link">← Volver al catálogo</Link>
      <div className="detalle-juego__panel">
        <div className="detalle-juego__imagen">
          {videojuego.imagen ? (
            <img src={videojuego.imagen} alt={`Portada de ${videojuego.nombre}`} />
          ) : (
            <span>PixelPlay</span>
          )}
        </div>
        <div className="detalle-juego__info">
          <p className="eyebrow">{videojuego.categoria?.nombre || "Videojuego"}</p>
          <h1>{videojuego.nombre}</h1>
          {videojuego.puntajeMetacritic != null && (
            <p className="puntaje-detalle">Metacritic <strong>{videojuego.puntajeMetacritic}</strong></p>
          )}
          <p className="detalle-juego__descripcion">
            {videojuego.descripcion || "No hay una descripción disponible para este título."}
          </p>
          <div className="detalle-juego__compra">
            <div>
              <span>Precio</span>
              <strong>{formatoPrecio(videojuego.precio)}</strong>
            </div>
            <Comprar videojuego={videojuego} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetalleVideojuegoPage;
