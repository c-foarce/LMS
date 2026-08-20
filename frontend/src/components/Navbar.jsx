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
    const isTeacher = user?.role === "teacher"
    const isStudent = user?.role === "student"

    const roleName = user.role.charAt(0).toUpperCase() + user.role.slice(1)

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
            <NavLink to={isLoggedIn ? "/app/dashboard/" : "/"}>{roleName} Home</NavLink>

            {/* Courses - anyone can access, currently admin have no use here */}
            <NavLink to="/app/courses/">My Courses</NavLink>

            {/* MyGrades - Student view for their graded work */}
            {isStudent && (
                <NavLink to="/app/courses/grades">My Grades</NavLink>
            )}

            {/* New Course- admin or teachers can access */}
            {(isTeacher || isAdmin) && (
                <NavLink to="/app/courses/new/">New Course</NavLink>
            )}

            {isTeacher && (
                <NavLink to="/app/courses/progress/">
                    Grading
                </NavLink>
            )}

            {/* New User - only Admin can access */}
            {isAdmin && (
                <NavLink to="/app/accounts/new/">New User</NavLink>
            )}

            {/* New Enrolments - admin or teacher can access */}
            {(isTeacher || isAdmin) && (
                <NavLink to="/app/courses/enrolments/new/">New Enrolment</NavLink>
            )}

            {/* Enrolment List - admin only view */}
            {isAdmin && (
                <NavLink to="/app/courses/enrolments/all/">Enrolments List</NavLink>
            )}

            {/* Users List - admin view only */}
            {isAdmin && (
                <NavLink to="/app/accounts/all/">User List</NavLink>
            )}

            {/* Course List - different form S+T view, this is a list of all courses, for admin editing purposes */}
            {(isAdmin || isStudent) && (
                <NavLink to="/app/courses/all/">Course List</NavLink>
            )}

            {isStudent && (
                <NavLink to="/app/courses/enrolments/complete/">Completion</NavLink>
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