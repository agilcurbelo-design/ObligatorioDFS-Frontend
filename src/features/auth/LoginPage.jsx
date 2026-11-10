import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Aviso from "../../components/Comun/Aviso";
import { limpiarErrorAuth, login } from "./authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, usuario } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });
  const cargando = status === "loading";

  useEffect(() => {
    dispatch(limpiarErrorAuth());
  }, [dispatch]);

  useEffect(() => {
    if (usuario) navigate("/", { replace: true });
  }, [usuario, navigate]);

  const enviar = (datos) => dispatch(login(datos));

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Qué bueno verte</p>
        <h1>Ingresá a tu cuenta</h1>
        <p className="auth-card__intro">Continuá explorando tu próxima aventura.</p>
        {location.state?.mensaje && <Aviso tipo="info">{location.state.mensaje}</Aviso>}
        {error && <Aviso>{error}</Aviso>}
        <form className="formulario" onSubmit={handleSubmit(enviar)} noValidate>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            autoComplete="username"
            maxLength={30}
            {...register("username", {
              required: "Ingresá tu usuario.",
              minLength: { value: 3, message: "Debe tener al menos 3 caracteres." },
            })}
          />
          {errors.username && <span className="campo-error">{errors.username.message}</span>}
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            maxLength={30}
            {...register("password", {
              required: "Ingresá tu contraseña.",
              minLength: { value: 6, message: "Debe tener al menos 6 caracteres." },
            })}
          />
          {errors.password && <span className="campo-error">{errors.password.message}</span>}
          <button className="boton boton--primario boton--ancho" type="submit" disabled={!isValid || cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="auth-card__pie">
          ¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
