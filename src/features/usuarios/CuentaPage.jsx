import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Aviso from "../../components/Comun/Aviso";
import Cargando from "../../components/Comun/Cargando";
import {
  actualizarPerfil,
  cambiarPlanPremium,
  obtenerPuntos,
  obtenerUsuario,
  recomendarVideojuego,
} from "./usuariosApi";
import { actualizarUsuarioSesion } from "../auth/authSlice";
import { LIMITE_COMPRAS_PLUS, obtenerComprasRestantes } from "../compras/carritoSlice";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(valor || 0);

const formatoFecha = (fecha) => {
  const fechaCompra = new Date(fecha);
  return Number.isNaN(fechaCompra.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-UY", { dateStyle: "medium" }).format(fechaCompra);
};

const CuentaPage = () => {
  const dispatch = useDispatch();
  const { usuario: sesion } = useSelector((state) => state.auth);
  const [perfil, setPerfil] = useState(null);
  const [puntos, setPuntos] = useState(sesion?.puntos || 0);
  const [recomendacion, setRecomendacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [recomendando, setRecomendando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [editando, setEditando] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });
  const id = sesion?._id;

  useEffect(() => {
    if (!id) return undefined;
    let activo = true;
    Promise.all([obtenerUsuario(id), obtenerPuntos(id)])
      .then(([datosPerfil, datosPuntos]) => {
        if (!activo) return;
        setPerfil(datosPerfil);
        setPuntos(datosPuntos.puntos);
        reset({ username: datosPerfil.username });
      })
      .catch((fallo) => {
        if (activo) setError(fallo.response?.data?.message || "No se pudo cargar tu cuenta.");
      })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [id, reset]);

  const resumenCompras = useMemo(() => {
    const compras = perfil?.compras || [];
    return [
      { titulo: "Pagadas con dinero", cantidad: compras.filter((compra) => compra.metodoPago === "dinero").length },
      { titulo: "Pagadas con puntos", cantidad: compras.filter((compra) => compra.metodoPago === "puntos").length },
    ];
  }, [perfil]);
  const maxCompras = Math.max(1, ...resumenCompras.map((item) => item.cantidad));
  const totalCompras = perfil?.compras?.length || 0;
  const comprasRestantes = obtenerComprasRestantes({ compras: perfil?.compras });
  const historialCompras = useMemo(
    () => [...(perfil?.compras || [])].sort(
      (a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime(),
    ),
    [perfil],
  );

  const guardarPerfil = async ({ username }) => {
    setGuardando(true);
    setError("");
    try {
      const actualizado = await actualizarPerfil(id, { username: username.trim() });
      setPerfil((actual) => ({ ...actual, ...actualizado }));
      dispatch(actualizarUsuarioSesion({ username: actualizado.username }));
      setEditando(false);
      setAviso("Tu nombre de usuario se actualizó.");
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudo actualizar tu perfil.");
    } finally {
      setGuardando(false);
    }
  };

  const mejorarPlan = async () => {
    setGuardando(true);
    setError("");
    try {
      const actualizado = await cambiarPlanPremium(id);
      setPerfil((actual) => ({ ...actual, ...actualizado }));
      dispatch(actualizarUsuarioSesion({ plan: actualizado.plan }));
      setAviso("¡Ya sos parte de PixelPlay Premium!");
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudo cambiar el plan.");
    } finally {
      setGuardando(false);
    }
  };

  const pedirRecomendacion = async () => {
    setRecomendando(true);
    setError("");
    try {
      const resultado = await recomendarVideojuego(id);
      setRecomendacion(resultado.recomendacion);
      setPuntos(resultado.puntos);
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudo obtener una recomendación.");
    } finally {
      setRecomendando(false);
    }
  };

  if (cargando && id) return <Cargando texto="Cargando tu cuenta..." />;
  const mensajeError = id
    ? error
    : "No se encontró el identificador de tu sesión. Cerrá sesión e ingresá nuevamente.";

  return (
    <section className="cuenta-pagina">
      <div className="seccion-titulo">
        <div><p className="eyebrow">Tu espacio PixelPlay</p><h1>Mi cuenta</h1></div>
        <span className={`plan-badge plan-badge--${perfil?.plan || sesion?.plan}`}>
          Plan {perfil?.plan || sesion?.plan}
        </span>
      </div>
      {mensajeError && <Aviso>{mensajeError}</Aviso>}
      {aviso && <Aviso tipo="exito" onClose={() => setAviso("")}>{aviso}</Aviso>}

      <div className="cuenta-grid">
        <section className="cuenta-card">
          <p className="eyebrow">Perfil</p>
          <h2>Hola, {perfil?.username || sesion?.username}</h2>
          {!editando ? (
            <div className="perfil-datos">
              <p><span>Usuario</span><strong>{perfil?.username}</strong></p>
              <p><span>Rol</span><strong>{perfil?.rol}</strong></p>
              <p><span>Plan</span><strong>{perfil?.plan}</strong></p>
              <button type="button" className="boton boton--secundario" onClick={() => setEditando(true)}>
                Editar usuario
              </button>
            </div>
          ) : (
            <form className="formulario" onSubmit={handleSubmit(guardarPerfil)} noValidate>
              <label htmlFor="username">Nombre de usuario</label>
              <input id="username" maxLength={30} {...register("username", {
                required: "El usuario es obligatorio.",
                minLength: { value: 3, message: "Debe tener al menos 3 caracteres." },
                maxLength: { value: 30, message: "No puede superar los 30 caracteres." },
              })} />
              {errors.username && <span className="campo-error">{errors.username.message}</span>}
              <div className="formulario__acciones">
                <button className="boton boton--primario" type="submit" disabled={!isValid || guardando}>Guardar</button>
                <button className="boton boton--texto" type="button" onClick={() => { setEditando(false); reset({ username: perfil?.username }); }}>Cancelar</button>
              </div>
            </form>
          )}
        </section>

        <section className="cuenta-card cuenta-card--puntos">
          <p className="eyebrow">Saldo de recompensas</p>
          <strong className="puntos-total">{new Intl.NumberFormat("es-UY").format(puntos)}</strong>
          <span>puntos disponibles</span>
          <p className="campo-ayuda">El canje con puntos está disponible para el plan premium.</p>
        </section>

        <section className="cuenta-card">
          <p className="eyebrow">Límite de compras</p>
          <h2>{perfil?.plan === "plus" ? "Tu plan Plus" : "Tu plan Premium"}</h2>
          {perfil?.plan === "plus" ? (
            <>
              <p className="compras-limite">
                Te quedan <strong>{comprasRestantes}</strong> de {LIMITE_COMPRAS_PLUS} compras.
              </p>
              <div
                className="grafico-barras__fondo"
                role="img"
                aria-label={`${totalCompras} de ${LIMITE_COMPRAS_PLUS} compras realizadas`}
              >
                <span style={{ width: `${Math.min(100, (totalCompras / LIMITE_COMPRAS_PLUS) * 100)}%` }} />
              </div>
            </>
          ) : (
            <p className="compras-limite">Tenés compras ilimitadas con tu plan Premium.</p>
          )}
        </section>

        <section className="cuenta-card">
          <p className="eyebrow">Tu actividad</p>
          <h2>Compras por método de pago</h2>
          {(perfil?.compras || []).length === 0 && <p className="campo-ayuda">Todavía no registrás compras.</p>}
          <div className="grafico-barras" role="img" aria-label="Cantidad de compras separadas por método de pago">
            {resumenCompras.map((dato) => (
              <div className="grafico-barras__fila" key={dato.titulo}>
                <div><span>{dato.titulo}</span><strong>{dato.cantidad}</strong></div>
                <div className="grafico-barras__fondo">
                  <span style={{ width: `${(dato.cantidad / maxCompras) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cuenta-card cuenta-card--premium">
          <p className="eyebrow">Más posibilidades</p>
          <h2>PixelPlay Premium</h2>
          <p>Accedé al pago con puntos y ganá puntos al comprar con dinero.</p>
          {perfil?.plan === "plus" ? (
            <button type="button" className="boton boton--primario" disabled={guardando} onClick={mejorarPlan}>
              {guardando ? "Actualizando..." : "Cambiar a Premium"}
            </button>
          ) : (
            <span className="premium-activo">Tu plan premium está activo</span>
          )}
        </section>
      </div>

      <section className="historial-compras">
        <div className="seccion-titulo">
          <div>
            <p className="eyebrow">Tu colección</p>
            <h2>Videojuegos comprados</h2>
          </div>
          <span className="resultado-total">{historialCompras.length} compras</span>
        </div>
        {historialCompras.length === 0 ? (
          <p className="campo-ayuda">Todavía no compraste videojuegos. Explorá el catálogo para encontrar tu próximo juego.</p>
        ) : (
          <div className="historial-compras__lista">
            {historialCompras.map((compra, indice) => {
              const videojuego = compra.videojuego && typeof compra.videojuego === "object"
                ? compra.videojuego
                : null;
              return (
                <article
                  className="historial-compra"
                  key={`${videojuego?._id || compra.videojuego}-${compra.fecha || indice}`}
                >
                  {videojuego?.imagen ? (
                    <img
                      className="historial-compra__imagen"
                      src={videojuego.imagen}
                      alt={`Portada de ${videojuego.nombre}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="historial-compra__imagen historial-compra__imagen--vacia" aria-hidden="true">
                      PP
                    </div>
                  )}
                  <div className="historial-compra__datos">
                    {videojuego?._id ? (
                      <Link to={`/videojuegos/${videojuego._id}`} className="historial-compra__nombre">
                        {videojuego.nombre}
                      </Link>
                    ) : (
                      <strong className="historial-compra__nombre">
                        {videojuego?.nombre || "Videojuego ya no disponible"}
                      </strong>
                    )}
                    <span>{videojuego?.categoria?.nombre || "Videojuego"}</span>
                    <time dateTime={compra.fecha || undefined}>{formatoFecha(compra.fecha)}</time>
                  </div>
                  <div className="historial-compra__detalle">
                    <strong>{formatoPrecio(compra.precio)}</strong>
                    <span>{compra.metodoPago === "puntos" ? "Pagado con puntos" : "Pagado con dinero"}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="recomendacion-card">
        <div><p className="eyebrow">Elegido para vos</p><h2>¿Qué podés comprar con tus puntos?</h2></div>
        <button type="button" className="boton boton--secundario" disabled={recomendando} onClick={pedirRecomendacion}>
          {recomendando ? "Buscando..." : "Pedir recomendación"}
        </button>
        {recomendacion && <p className="recomendacion-card__resultado">{recomendacion}</p>}
      </section>
    </section>
  );
};

export default CuentaPage;
