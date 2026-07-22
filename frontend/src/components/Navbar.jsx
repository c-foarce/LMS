//styling imports

//clsx for effective module combination
import clsx from "clsx"

//important imports for state and navigation
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("access") !== null;

    function handleLogout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/");
    }

    return (
        <nav style={{ display: "flex", gap: "12px", padding: "10px" }}>
            {/* Later: add className={({ isActive }) => ... } using clsx */}
            <NavLink to={isLoggedIn ? "/app/dashboard" : "/"}>Home</NavLink>

            {/* Later: add className={({ isActive }) => ... } using clsx */}
            <NavLink to="/app/courses">Courses</NavLink>

            {/* Later: add className={({ isActive }) => ... } using clsx */}
            <NavLink to="/app/courses/new">New Course</NavLink>

            {/* Later: add className={({ isActive }) => ... } using clsx */}
            <NavLink to="/app/accounts/new"> New User </NavLink>

            {}
            <NavLink to="courses/enrolments/new"> New Enrolment</NavLink>

            {isLoggedIn ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <>
                    {/* Later: add className={({ isActive }) => ... } using clsx */}
                    <NavLink to="/login">Login</NavLink>
                </>
            )}
        </nav>
    );
}

export default Navbar;