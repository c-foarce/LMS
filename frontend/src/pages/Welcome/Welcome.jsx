import { useNavigate } from "react-router-dom";

import styles from "./Welcome.module.css"

function Welcome() {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>Welcome</h1>
                <p>Lesson Management System</p>

                <div className={styles.actions}>
                    <button onClick={() => navigate("/login")}>
                        Log in
                    </button>

                    <button onClick={() => navigate("/register")}>
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;