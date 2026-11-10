import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../components/Comun/Aviso";
import Cargando from "../../components/Comun/Cargando";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from "./categoriasApi";

const AdminCategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const cargar = async () => {
    setCargando(true);
    try {
      setCategorias(await listarCategorias());
      setError("");
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch((fallo) => setError(fallo.response?.data?.message || "No se pudieron cargar las categorías."))
      .finally(() => setCargando(false));
  }, []);

  const prepararEdicion = (categoria) => {
    setEditando(categoria);
    reset({ nombre: categoria.nombre });
  };

  const cancelar = () => {
    setEditando(null);
    reset({ nombre: "" });
  };

  const guardar = async ({ nombre }) => {
    setGuardando(true);
    setError("");
    try {
      if (editando) {
        await actualizarCategoria(editando._id, { nombre: nombre.trim() });
        setAviso("Categoría actualizada.");
      } else {
        await crearCategoria({ nombre: nombre.trim() });
        setAviso("Categoría creada.");
      }
      cancelar();
      await cargar();
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudo guardar la categoría.");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    setError("");
    try {
      await eliminarCategoria(categoria._id);
      setCategorias((actuales) => actuales.filter((item) => item._id !== categoria._id));
      setAviso("Categoría eliminada.");
    } catch (fallo) {
      setError(fallo.response?.data?.message || "No se pudo eliminar la categoría.");
    }
  };

  return (
    <section className="admin-pagina">
      <div className="seccion-titulo">
        <div><p className="eyebrow">Herramientas de administración</p><h1>Categorías</h1></div>
      </div>
      {error && <Aviso>{error}</Aviso>}
      {aviso && <Aviso tipo="exito" onClose={() => setAviso("")}>{aviso}</Aviso>}
      <div className="admin-panel">
        <p className="eyebrow">{editando ? "Editar" : "Nueva categoría"}</p>
        <h2>{editando ? editando.nombre : "Organizá el catálogo"}</h2>
        <form className="formulario formulario--en-linea" onSubmit={handleSubmit(guardar)} noValidate>
          <label htmlFor="nombre-categoria">Nombre</label>
          <input
            id="nombre-categoria"
            maxLength={50}
            {...register("nombre", {
              required: "El nombre es obligatorio.",
              minLength: { value: 2, message: "Debe tener al menos 2 caracteres." },
              validate: (valor) => Boolean(valor.trim()) || "El nombre no puede quedar vacío.",
            })}
          />
          {errors.nombre && <span className="campo-error">{errors.nombre.message}</span>}
          <div className="formulario__acciones">
            <button type="submit" className="boton boton--primario" disabled={!isValid || guardando}>
              {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear categoría"}
            </button>
            {editando && <button type="button" className="boton boton--secundario" onClick={cancelar}>Cancelar</button>}
          </div>
        </form>
      </div>
      <div className="admin-lista">
        <h2>Categorías disponibles</h2>
        {cargando && <Cargando texto="Cargando categorías..." />}
        {!cargando && categorias.map((categoria) => (
          <article className="admin-lista__fila" key={categoria._id}>
            <div><strong>{categoria.nombre}</strong></div>
            <button type="button" className="boton boton--texto" onClick={() => prepararEdicion(categoria)}>Editar</button>
            <button type="button" className="boton boton--peligro" onClick={() => borrar(categoria)}>Eliminar</button>
          </article>
        ))}
        {!cargando && categorias.length === 0 && <p className="campo-ayuda">No hay categorías cargadas.</p>}
      </div>
    </section>
  );
};

export default AdminCategoriasPage;
