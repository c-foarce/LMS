import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import styles from "./Register.module.css"

function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
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
                first_name: firstName,
                last_name: lastName,
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
        <div className={styles.page}>
            <div className={styles.card}>
                <button
                    className={styles.back}
                    type="button"
                    onClick={() => navigate("/")}
                >
                    ← Back
                </button>

                <h1>Register</h1>

                <form className={styles.form} onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="first-name">
                            First Name:
                        </label>

                        <input
                            id="first-name"
                            type="text"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="last-name">
                            Last Name:
                        </label>

                        <input
                            id="last-name"
                            type="text"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="username">
                            Username:
                        </label>

                        <input
                            id="username"
                            placeholder="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">
                            Password:
                        </label>

                        <input
                            id="password"
                            placeholder="password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-password">
                            Confirm Password:
                        </label>

                        <input
                            id="confirm-password"
                            placeholder="confirm password"
                            type="password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="role">
                            Account Type:
                        </label>

                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <button type="submit">Register</button>
                </form>

                {registerState.message && (
                    <p className={`${styles.message} ${styles[registerState.type]}`}>
                        {registerState.message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Register;