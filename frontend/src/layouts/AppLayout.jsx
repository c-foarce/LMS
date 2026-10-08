import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>

    </>
  );
}

export default AppLayout