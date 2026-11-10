import { Outlet } from "react-router-dom";
import Menu from "./Menu";

const Contenido = () => (
  <>
    <Menu />
    <main className="contenido">
      <Outlet />
    </main>
    <footer className="pie">
      <span>PixelPlay</span>
      <span>Una colección para quienes juegan.</span>
    </footer>
  </>
);

export default Contenido;
