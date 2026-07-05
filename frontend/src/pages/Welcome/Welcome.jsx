import { useNavigate } from "react-router-dom";

function Welcome() {

    const navigate = useNavigate();
    return (
        <div>
            <h1>Welcome</h1>
            <p>Lesson Management System</p>

            <button onClick={() => navigate("/login")}>Click to Log in</button>
        </div>
    );
}

export default Welcome