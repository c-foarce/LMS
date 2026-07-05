import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav style={{ display: "flex", gap: "12px", padding: "10px" }}>
            <Link to = "/">Home</Link>
            <Link to = "/courses">Courses</Link>
            <Link to = "/courses/new">New Course</Link>
            <Link to = "/login">Login</Link>
        </nav>
    )
}

export default Navbar