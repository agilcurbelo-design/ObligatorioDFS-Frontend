const Cargando = ({ texto = "Cargando..." }) => (
  <div className="cargando" role="status">
    <span className="cargando__spinner" aria-hidden="true" />
    <span>{texto}</span>
  </div>
);

export default Cargando;
