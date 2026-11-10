const Paginacion = ({ pagina, totalPaginas, onCambiar }) => {
  if (totalPaginas < 2) return null;

  return (
    <nav className="paginacion" aria-label="Paginación del catálogo">
      <button type="button" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </button>
      <span>
        Página {pagina} de {totalPaginas}
      </span>
      <button
        type="button"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
};

export default Paginacion;
