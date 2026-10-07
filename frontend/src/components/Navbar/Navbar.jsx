//styling imports
import styles from "./Navbar.module.css";

//clsx for effective module combination
import clsx from "clsx"

//important imports for state and navigation
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Navbar() {

    const navigate = useNavigate();

    const { user } = useAuth();

    const isAdmin = user?.role === "admin";
    const isTeacher = user?.role === "teacher";
    const isStudent = user?.role === "student";

    const roleName = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : ""

    function handleLogout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/");

    }

    return (
        <nav className={styles.navbar}>

            {/* Dashboard - anyone can access */}
            <NavLink
                to="/app/dashboard/"
                className={({ isActive }) =>
                    clsx(
                        styles.navLink,
                        isActive && styles.active
                    )
                }
            >
                {`${roleName} Home`}
            </NavLink>


            {/* Courses - Student and Teacher access */}
            {(isStudent || isTeacher) && (
                <NavLink
                    to="/app/courses/"
                    end
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    My Courses
                </NavLink>
            )}

            {/* MyGrades - Student view for their graded work */}
            {isStudent && (
                <NavLink
                    to="/app/courses/grades"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    My Grades
                </NavLink>
            )}

            {/* Grading - Teacher page for grading work */}
            {isTeacher && (
                <NavLink
                    to="/app/courses/progress/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    Grading
                </NavLink>
            )}

            {/* New User - only Admin can access */}
            {isAdmin && (
                <NavLink
                    to="/app/accounts/new/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    New User
                </NavLink>
            )}

            {/* Users List - admin view only */}
            {isAdmin && (
                <NavLink
                    to="/app/accounts/all/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    User List
                </NavLink>
            )}

            {/* New Course- admin or teachers can access */}
            {(isTeacher || isAdmin) && (
                <NavLink
                    to="/app/courses/new/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    New Course
                </NavLink>
            )}

            {/* Course List - different form S+T view, this is a list of all courses, for admin editing purposes */}
            {(isAdmin || isStudent) && (
                <NavLink
                    to="/app/courses/all/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    Course List
                </NavLink>
            )}

            {/* New Enrolments - admin or teacher can access */}
            {(isTeacher || isAdmin) && (
                <NavLink
                    to="/app/courses/enrolments/new/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    New Enrolment
                </NavLink>
            )}

            {/* Enrolment List - admin only view */}
            {isAdmin && (
                <NavLink
                    to="/app/courses/enrolments/all/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    Enrolments List
                </NavLink>
            )}

            {isStudent && (
                <NavLink
                    to="/app/courses/enrolments/complete/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    Completion
                </NavLink>
            )}

            {(isAdmin || isTeacher) && (
                <NavLink
                    to="/app/courses/enrolments/history/"
                    className={({ isActive }) =>
                        clsx(
                            styles.navLink,
                            isActive && styles.active
                        )
                    }
                >
                    {isAdmin ? "History" : "My History"}
                </NavLink>
            )}

            <button
                className={styles.logout}
                onClick={handleLogout}
            >
                Logout
            </button>
        </nav>
    );
}

export default Navbar;
