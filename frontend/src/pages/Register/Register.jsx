import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("student");

    const [registerState, setRegisterState] = useState({
        type: "",
        message: ""
    });

    const handleRegister = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setRegisterState({
                type: "error",
                message: "Passwords do not match."
            });
            return;
        }

        try {
            await api.post("accounts/register/", {
                username,
                password,
                role,
            });

            setRegisterState({
                type: "success",
                message: "Registration successful! Redirecting to login..."
            });

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {

            setRegisterState({
                type: "error",
                message: "Registration Failed."
            });
        }
    };

    return (
        <div>

            <button type="button" onClick={() => navigate("/")}>
                ← Back
            </button>

            <h1>Register</h1>

            <form onSubmit={handleRegister}>
                <label htmlFor="username">Username:</label>
                <input
                    id="username"
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    placeholder="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label htmlFor="confirm-password">Confirm Password:</label>
                <input
                    id="confirm-password"
                    placeholder="confirm password"
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <label htmlFor="role">Account Type:</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>

                <button type="submit">Register</button>
            </form>

            {registerState.message && (
                <p className={`message ${registerState.type}`}>
                    {registerState.message}
                </p>
            )}
        </div>
    );
}

export default Register;