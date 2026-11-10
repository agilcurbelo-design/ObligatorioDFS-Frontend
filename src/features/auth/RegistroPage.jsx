import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import Aviso from "../../components/Comun/Aviso";
import { limpiarErrorAuth, register } from "./authSlice";

const RegistroPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, usuario } = useSelector((state) => state.auth);
  const {
    register: campo,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });
  const password = useWatch({ control, name: "password" });
  const cargando = status === "loading";

  useEffect(() => {
    dispatch(limpiarErrorAuth());
  }, [dispatch]);

  useEffect(() => {
    if (usuario) navigate("/", { replace: true });
  }, [usuario, navigate]);

  const enviar = (datos) => dispatch(register(datos));

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Empezá tu colección</p>
        <h1>Crear cuenta</h1>
        <p className="auth-card__intro">Un usuario, un mundo de juegos por descubrir.</p>
        {error && <Aviso>{error}</Aviso>}
        <form className="formulario" onSubmit={handleSubmit(enviar)} noValidate>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            autoComplete="username"
            maxLength={30}
            {...campo("username", {
              required: "Elegí un nombre de usuario.",
              minLength: { value: 3, message: "Debe tener al menos 3 caracteres." },
              maxLength: { value: 30, message: "No puede superar los 30 caracteres." },
            })}
          />
          {errors.username && <span className="campo-error">{errors.username.message}</span>}
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            maxLength={30}
            {...campo("password", {
              required: "Ingresá una contraseña.",
              minLength: { value: 6, message: "Debe tener al menos 6 caracteres." },
              maxLength: { value: 30, message: "No puede superar los 30 caracteres." },
            })}
          />
          {errors.password && <span className="campo-error">{errors.password.message}</span>}
          <label htmlFor="confirmPassword">Repetir contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...campo("confirmPassword", {
              required: "Repetí tu contraseña.",
              validate: (valor) => valor === password || "Las contraseñas no coinciden.",
            })}
          />
          {errors.confirmPassword && (
            <span className="campo-error">{errors.confirmPassword.message}</span>
          )}
          <button className="boton boton--primario boton--ancho" type="submit" disabled={!isValid || cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p className="auth-card__pie">
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </div>
    </section>
  );
};

export default RegistroPage;
