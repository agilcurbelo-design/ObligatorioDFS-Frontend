const Aviso = ({ tipo = "error", children, onClose }) => (
  <div className={`aviso aviso--${tipo}`} role={tipo === "error" ? "alert" : "status"}>
    <span>{children}</span>
    {onClose && (
      <button className="aviso__cerrar" type="button" onClick={onClose} aria-label="Cerrar aviso">
        ×
      </button>
    )}
  </div>
);

export default Aviso;
