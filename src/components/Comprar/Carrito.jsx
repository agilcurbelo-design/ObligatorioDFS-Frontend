import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  obtenerComprasRestantes,
  quitarDelCarrito,
  vaciarCarrito,
} from "../../features/compras/carritoSlice";
import { cargarComprasUsuario } from "../../features/auth/authSlice";
import Comprar from "./Comprar";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(valor || 0);

const Carrito = () => {
  const dispatch = useDispatch();
  const carrito = useSelector((state) => state.carrito);
  const { usuario, comprasStatus, comprasError } = useSelector((state) => state.auth);
  const compras = usuario?.compras;
  const esPlus = usuario?.plan === "plus";
  const comprasValidadas = comprasStatus === "succeeded" && Array.isArray(compras);
  const restantes = obtenerComprasRestantes(usuario);

  if (!carrito.length) {
    return (
      <section className="estado-vacio carrito-vacio">
        <span>◇</span>
        <h1>Tu carrito está esperando</h1>
        <p>Agregá videojuegos desde el catálogo para tenerlos a mano.</p>
        <Link className="boton boton--primario" to="/">Explorar videojuegos</Link>
      </section>
    );
  }

  return (
    <section className="pagina-carrito">
      <div className="seccion-titulo">
        <div><p className="eyebrow">Antes de empezar a jugar</p><h1>Tu carrito</h1></div>
        <button className="boton boton--texto" type="button" onClick={() => dispatch(vaciarCarrito())}>
          Vaciar carrito
        </button>
      </div>
      <p className="aviso-carrito">
        Cada compra se confirma individualmente con la API. Si una falla, los juegos restantes siguen en tu carrito.
      </p>
      {esPlus && (
        <p className="aviso-carrito" role="status">
          {comprasValidadas
            ? `Tenés ${restantes} de 10 compras disponibles.`
            : comprasStatus === "failed"
              ? (
                <>
                  {comprasError}{" "}
                  <button
                    className="boton boton--texto"
                    type="button"
                    onClick={() => dispatch(cargarComprasUsuario(usuario._id))}
                  >
                    Reintentar
                  </button>
                </>
              )
              : "Estamos verificando cuántas compras te quedan."}
        </p>
      )}
      <div className="carrito-lista">
        {carrito.map((videojuego, index) => {
          const yaComprado = comprasValidadas && compras.includes(String(videojuego._id));
          const comprasPendientesAntes = comprasValidadas
            ? carrito
              .slice(0, index)
              .filter((juego) => !compras.includes(String(juego._id))).length
            : 0;
          const bloqueado = esPlus && (
            !comprasValidadas || yaComprado || comprasPendientesAntes >= restantes
          );
          return (
            <article className="carrito-item" key={videojuego._id}>
              <Link to={`/videojuegos/${videojuego._id}`} className="carrito-item__imagen">
                {videojuego.imagen && <img src={videojuego.imagen} alt="" />}
              </Link>
              <div className="carrito-item__datos">
                <Link to={`/videojuegos/${videojuego._id}`}><h2>{videojuego.nombre}</h2></Link>
                <span>{videojuego.categoria?.nombre || "Videojuego"}</span>
                <strong>{formatoPrecio(videojuego.precio)}</strong>
                <Comprar
                  videojuego={videojuego}
                  bloqueado={bloqueado}
                  onCompra={(id) => dispatch(quitarDelCarrito(id))}
                />
              </div>
              <button
                type="button"
                className="boton boton--texto carrito-item__quitar"
                onClick={() => dispatch(quitarDelCarrito(videojuego._id))}
              >
                Quitar
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Carrito;