//styling imports

//clsx for effective module combination
import clsx from "clsx"

//important imports for state and navigation
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {

    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const isLoggedIn = localStorage.getItem("access") !== null;

    const isAdmin = user?.role === "admin";
    const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";
    const isStudent = user?.role === "student"

    function handleLogout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setUser(null)

        navigate("/");
    }

    return (
        <nav style={{ display: "flex", gap: "12px", padding: "10px" }}>

            {/* Later: add className={({ isActive }) => ... } using clsx */}

            {/* Dashboard - anyone can access */}
            <NavLink to={isLoggedIn ? "/app/dashboard/" : "/"}>Home</NavLink>

            {/* Courses - anyone can access, currently admin have no use here */}
            <NavLink to="/app/courses/">Courses</NavLink>

            {/* New Course- admin or teachers can access */}
            {isTeacherOrAdmin && (
                <NavLink to="/app/courses/new/">New Course</NavLink>
            )}

            {/* New User - only Admin can access */}
            {isAdmin && (
                <NavLink to="/app/accounts/new/">New User</NavLink>
            )}

            {/* New Enrolments - admin or teacher can access */}
            {isTeacherOrAdmin && (
                <NavLink to="/app/courses/enrolments/new/">New Enrolment</NavLink>
            )}

            {/* Enrolment List - admin only view */}
            {isAdmin && (
                <NavLink to="/app/courses/enrolments/all/">Enrolments List</NavLink>
            )}

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