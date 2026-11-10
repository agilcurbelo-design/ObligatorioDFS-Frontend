import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Aviso from "../../components/Comun/Aviso";
import Cargando from "../../components/Comun/Cargando";
import Paginacion from "../../components/Comun/Paginacion";
import TarjetaVideojuego from "../../components/Videojuegos/TarjetaVideojuego";
import { buscarEnRawg } from "./videojuegosApi";
import { cargarVideojuegos } from "./videojuegosSlice";

const CatalogoPage = () => {
  const dispatch = useDispatch();
  const { items, pagination, status, error } = useSelector((state) => state.videojuegos);
  const { usuario } = useSelector((state) => state.auth);
  const [termino, setTermino] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [categoria, setCategoria] = useState("todas");
  const [orden, setOrden] = useState("recientes");
  const [externos, setExternos] = useState([]);
  const [errorExterno, setErrorExterno] = useState("");
  const [cargandoExterno, setCargandoExterno] = useState(false);

  useEffect(() => {
    dispatch(cargarVideojuegos({ nombre: busqueda, page: pagina }));
  }, [dispatch, busqueda, pagina]);

  const categorias = useMemo(
    () => [...new Set(items.map((juego) => juego.categoria?.nombre).filter(Boolean))].sort(),
    [items],
  );
  const visibles = useMemo(() => {
    const filtrados = items.filter(
      (juego) => categoria === "todas" || juego.categoria?.nombre === categoria,
    );
    return [...filtrados].sort((a, b) => {
      if (orden === "precio-menor") return a.precio - b.precio;
      if (orden === "precio-mayor") return b.precio - a.precio;
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
      return 0;
    });
  }, [items, categoria, orden]);

  const enviarBusqueda = (event) => {
    event.preventDefault();
    setBusqueda(termino.trim());
    setPagina(1);
    setCategoria("todas");
    setExternos([]);
  };

  const buscarExternos = async () => {
    if (!termino.trim()) {
      setErrorExterno("Escribí el nombre de un juego para buscar.");
      return;
    }
    setCargandoExterno(true);
    setErrorExterno("");
    try {
      setExternos(await buscarEnRawg(termino.trim()));
    } catch (error) {
      setErrorExterno(error.response?.data?.message || "No se pudo consultar la búsqueda externa.");
    } finally {
      setCargandoExterno(false);
    }
  };

  const cambiarPagina = setPagina;

  return (
    <>
      <section className="hero-tienda">
        <div className="hero-tienda__texto">
          <p className="eyebrow">Tu próxima aventura empieza acá</p>
          <h1>Jugá a tu manera.</h1>
          <p>Encontrá tu próximo favorito entre títulos seleccionados para vos.</p>
          <a className="boton boton--primario" href="#catalogo">Explorar catálogo</a>
        </div>
        <div className="hero-tienda__arte" aria-hidden="true">
          <span className="hero-tienda__circulo" />
          <span className="hero-tienda__pixel">PLAY<br />MORE</span>
          <span className="hero-tienda__dado">✦</span>
        </div>
      </section>

      <section className="catalogo" id="catalogo">
        <div className="seccion-titulo">
          <div>
            <p className="eyebrow">La selección PixelPlay</p>
            <h2>Descubrí videojuegos</h2>
          </div>
          <span className="resultado-total">{pagination.total || 0} títulos</span>
        </div>

        <form className="filtros" onSubmit={enviarBusqueda}>
          <div className="buscador" role="search">
            <span className="solo-lectores">Buscar en catálogo</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Buscar en catálogo"
              value={termino}
              onChange={(event) => setTermino(event.target.value)}
              placeholder="Buscar videojuegos..."
            />
            <button type="submit">Buscar</button>
          </div>
          <label>
            <span className="solo-lectores">Filtrar por categoría</span>
            <select value={categoria} onChange={(event) => setCategoria(event.target.value)}>
              <option value="todas">Todas las categorías</option>
              {categorias.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
            </select>
          </label>
          <label>
            <span className="solo-lectores">Ordenar resultados</span>
            <select value={orden} onChange={(event) => setOrden(event.target.value)}>
              <option value="recientes">Más recientes</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="precio-menor">Menor precio</option>
              <option value="precio-mayor">Mayor precio</option>
            </select>
          </label>
        </form>

        {error && <Aviso>{error}</Aviso>}
        {status === "loading" && <Cargando texto="Buscando en el catálogo..." />}
        {status !== "loading" && visibles.length === 0 && (
          <div className="estado-vacio">
            <span>◌</span>
            <h3>No encontramos títulos</h3>
            <p>Probá con otra búsqueda o volvé a explorar todo el catálogo.</p>
            {busqueda && (
              <button
                type="button"
                className="boton boton--secundario"
                onClick={() => { setTermino(""); setBusqueda(""); setPagina(1); }}
              >
                Ver todos los juegos
              </button>
            )}
          </div>
        )}
        {visibles.length > 0 && (
          <div className="juegos-grid">
            {visibles.map((videojuego) => (
              <TarjetaVideojuego key={videojuego._id} videojuego={videojuego} />
            ))}
          </div>
        )}
        <Paginacion
          pagina={pagination.page}
          totalPaginas={pagination.totalPages}
          onCambiar={cambiarPagina}
        />
      </section>

      {usuario && (
        <section className="busqueda-externa">
          <div>
            <p className="eyebrow">Explorá más allá</p>
            <h2>¿No está en el catálogo?</h2>
            <p>Buscá títulos en RAWG y compartí el nombre con administración.</p>
          </div>
          <div className="busqueda-externa__accion">
            <button
              type="button"
              className="boton boton--secundario"
              disabled={cargandoExterno}
              onClick={buscarExternos}
            >
              {cargandoExterno ? "Buscando..." : "Buscar en RAWG"}
            </button>
          </div>
          {errorExterno && <Aviso>{errorExterno}</Aviso>}
          {externos.length > 0 && (
            <ul className="resultados-externos">
              {externos.map((juego) => (
                <li key={juego.id}>
                  {juego.imagen && <img src={juego.imagen} alt="" loading="lazy" />}
                  <span>{juego.nombre}</span>
                  {juego.puntajeMetacritic != null && <small>Metacritic {juego.puntajeMetacritic}</small>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
};

export default CatalogoPage;
