import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Aviso from "../../components/Comun/Aviso";
import Cargando from "../../components/Comun/Cargando";
import Paginacion from "../../components/Comun/Paginacion";
import { actualizarVideojuego, buscarEnRawg, subirImagen } from "./videojuegosApi";
import {
  cargarVideojuegos,
  crearVideojuegoAdmin,
  eliminarVideojuegoAdmin,
  actualizarVideojuegoLocal,
} from "./videojuegosSlice";
import { listarCategorias } from "../categorias/categoriasApi";

const AdminVideojuegosPage = () => {
  const dispatch = useDispatch();
  const { items, pagination, status } = useSelector((state) => state.videojuegos);
  const [categorias, setCategorias] = useState([]);
  const [videojuegoEditando, setVideojuegoEditando] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [consultaRawg, setConsultaRawg] = useState("");
  const [resultadosRawg, setResultadosRawg] = useState([]);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    dispatch(cargarVideojuegos({ page: pagina }));
  }, [dispatch, pagina]);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch((fallo) => {
      setError(fallo.response?.data?.message || "No se pudieron cargar las categorías.");
    });
  }, []);

  const comenzarEdicion = (juego) => {
    setVideojuegoEditando(juego);
    setArchivo(null);
    reset({
      nombre: juego.nombre,
      precio: juego.precio,
      categoria: juego.categoria?._id || juego.categoria || "",
      descripcion: juego.descripcion || "",
      puntajeMetacritic: juego.puntajeMetacritic ?? "",
      imagen: juego.imagen || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setVideojuegoEditando(null);
    setArchivo(null);
    reset({ nombre: "", precio: "", categoria: "", descripcion: "", puntajeMetacritic: "", imagen: "" });
  };

  const guardar = async (datos) => {
    setCargando(true);
    setError("");
    setAviso("");
    try {
      if (videojuegoEditando) {
        const imagen = archivo ? await subirImagen(archivo) : datos.imagen;
        const datosActualizacion = { ...datos, imagen };
        if (datosActualizacion.puntajeMetacritic === "") delete datosActualizacion.puntajeMetacritic;
        if (!datosActualizacion.descripcion?.trim()) delete datosActualizacion.descripcion;
        const actualizado = await actualizarVideojuego(videojuegoEditando._id, datosActualizacion);
        const categoria = categorias.find(
          (item) => item._id === String(actualizado.categoria),
        ) || videojuegoEditando.categoria;
        dispatch(actualizarVideojuegoLocal({ ...actualizado, categoria }));
        setAviso("Videojuego actualizado correctamente.");
      } else {
        const creado = await dispatch(crearVideojuegoAdmin({
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio: datos.precio,
          categoria: datos.categoria,
        })).unwrap();
        if (archivo) {
          const imagen = await subirImagen(archivo);
          const actualizado = await actualizarVideojuego(creado._id, { imagen });
          dispatch(actualizarVideojuegoLocal({
            ...actualizado,
            categoria: categorias.find((item) => item._id === String(actualizado.categoria)),
          }));
        } else {
          dispatch(actualizarVideojuegoLocal({
            ...creado,
            categoria: categorias.find((item) => item._id === String(creado.categoria)),
          }));
        }
        setPagina(1);
        setAviso("Videojuego creado correctamente.");
      }
      cancelarEdicion();
    } catch (fallo) {
      setError(
        fallo.response?.data?.message ||
        fallo.response?.data?.error ||
        fallo ||
        "No se pudo guardar el videojuego.",
      );
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (juego) => {
    if (!window.confirm(`¿Eliminar "${juego.nombre}" del catálogo?`)) return;
    setError("");
    try {
      await dispatch(eliminarVideojuegoAdmin(juego._id)).unwrap();
      setAviso("Videojuego eliminado.");
    } catch (fallo) {
      setError(fallo || "No se pudo eliminar el videojuego.");
    }
  };

  const buscarRawg = async (event) => {
    event.preventDefault();
    if (!consultaRawg.trim()) return;
    setError("");
    setCargando(true);
    try {
      setResultadosRawg(await buscarEnRawg(consultaRawg.trim()));
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudieron buscar títulos externos.");
    } finally {
      setCargando(false);
    }
  };

  const seleccionarRawg = (juego) => {
    setValue("nombre", juego.nombre, { shouldValidate: true });
    setResultadosRawg([]);
  };

  return (
    <section className="admin-pagina">
      <div className="seccion-titulo">
        <div><p className="eyebrow">Herramientas de administración</p><h1>Videojuegos</h1></div>
        <span className="resultado-total">{pagination.total || 0} títulos</span>
      </div>
      {error && <Aviso>{typeof error === "string" ? error : "No se pudo completar la operación."}</Aviso>}
      {aviso && <Aviso tipo="exito" onClose={() => setAviso("")}>{aviso}</Aviso>}

      <div className="admin-panel">
        <div className="admin-panel__encabezado">
          <div>
            <p className="eyebrow">{videojuegoEditando ? "Editar ficha" : "Nuevo ingreso"}</p>
            <h2>{videojuegoEditando ? videojuegoEditando.nombre : "Agregar videojuego"}</h2>
          </div>
          {videojuegoEditando && (
            <button type="button" className="boton boton--texto" onClick={cancelarEdicion}>Cancelar edición</button>
          )}
        </div>
        {!videojuegoEditando && (
          <form className="busqueda-rawg" onSubmit={buscarRawg}>
            <label htmlFor="busqueda-rawg">Opcional: buscar título para importar desde RAWG</label>
            <div className="busqueda-rawg__fila">
              <input
                id="busqueda-rawg"
                value={consultaRawg}
                onChange={(event) => setConsultaRawg(event.target.value)}
                placeholder="Ej. Hollow Knight"
              />
              <button className="boton boton--secundario" disabled={cargando || !consultaRawg.trim()}>
                Buscar
              </button>
            </div>
            {resultadosRawg.length > 0 && (
              <ul className="rawg-resultados">
                {resultadosRawg.map((juego) => (
                  <li key={juego.id}>
                    <span>{juego.nombre}</span>
                    <button className="boton boton--texto" type="button" onClick={() => seleccionarRawg(juego)}>
                      Usar nombre
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
        )}
        <form className="formulario formulario--admin" onSubmit={handleSubmit(guardar)} noValidate>
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            maxLength={100}
            {...register("nombre", {
              required: "El nombre es obligatorio.",
              validate: (valor) => Boolean(valor.trim()) || "El nombre no puede estar vacío.",
            })}
          />
          {errors.nombre && <span className="campo-error">{errors.nombre.message}</span>}
          <label htmlFor="precio">Precio (UYU)</label>
          <input id="precio" type="number" min="0" step="0.01"
            {...register("precio", { required: "El precio es obligatorio.", valueAsNumber: true, min: { value: 0, message: "El precio no puede ser negativo." } })}
          />
          {errors.precio && <span className="campo-error">{errors.precio.message}</span>}
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" {...register("categoria", { required: "Seleccioná una categoría." })}>
            <option value="">Seleccionar...</option>
            {categorias.map((categoria) => (
              <option key={categoria._id} value={categoria._id}>{categoria.nombre}</option>
            ))}
          </select>
          {errors.categoria && <span className="campo-error">{errors.categoria.message}</span>}
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" rows="4" maxLength="2000"
            {...register("descripcion", { validate: (valor) => !valor || Boolean(valor.trim()) || "La descripción no puede estar vacía." })}
          />
          {errors.descripcion && <span className="campo-error">{errors.descripcion.message}</span>}
          {videojuegoEditando && (
            <>
              <label htmlFor="puntajeMetacritic">Puntaje Metacritic</label>
              <input id="puntajeMetacritic" type="number" min="0" max="100"
                {...register("puntajeMetacritic", {
                  setValueAs: (valor) => valor === "" ? "" : Number(valor),
                  validate: (valor) => valor === "" || (valor >= 0 && valor <= 100) || "Debe estar entre 0 y 100.",
                })}
              />
              {errors.puntajeMetacritic && <span className="campo-error">{errors.puntajeMetacritic.message}</span>}
              <label htmlFor="imagen">URL de imagen (opcional)</label>
              <input id="imagen" type="url" {...register("imagen", { validate: (valor) => !valor || /^https?:\/\/.+/.test(valor) || "Ingresá una URL válida." })} />
              {errors.imagen && <span className="campo-error">{errors.imagen.message}</span>}
            </>
          )}
          <label htmlFor="archivo-imagen">Subir imagen (opcional)</label>
          <input
            id="archivo-imagen"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file && file.size > 5 * 1024 * 1024) {
                setError("La imagen debe pesar 5 MB o menos.");
                event.target.value = "";
                setArchivo(null);
              } else {
                setError("");
                setArchivo(file || null);
              }
            }}
          />
          {archivo && <span className="campo-ayuda">Imagen seleccionada: {archivo.name}</span>}
          {!videojuegoEditando && (
            <span className="campo-ayuda">
              Se creará con el nombre, precio y categoría ingresados. La búsqueda en RAWG es opcional.
            </span>
          )}
          <div className="formulario__acciones">
            <button className="boton boton--primario" type="submit" disabled={!isValid || cargando}>
              {cargando ? "Guardando..." : videojuegoEditando ? "Guardar cambios" : "Crear videojuego"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-lista">
        <h2>Catálogo actual</h2>
        {status === "loading" && <Cargando texto="Cargando videojuegos..." />}
        {status !== "loading" && items.length === 0 && <p className="campo-ayuda">No hay títulos en esta página.</p>}
        {items.map((juego) => (
          <article className="admin-lista__fila" key={juego._id}>
            {juego.imagen && <img src={juego.imagen} alt="" loading="lazy" />}
            <div><strong>{juego.nombre}</strong><span>{juego.categoria?.nombre || "Sin categoría"}</span></div>
            <button className="boton boton--texto" type="button" onClick={() => comenzarEdicion(juego)}>Editar</button>
            <button className="boton boton--peligro" type="button" onClick={() => eliminar(juego)}>Eliminar</button>
          </article>
        ))}
        <Paginacion pagina={pagination.page} totalPaginas={pagination.totalPages} onCambiar={setPagina} />
      </div>
    </section>
  );
};

export default AdminVideojuegosPage;
