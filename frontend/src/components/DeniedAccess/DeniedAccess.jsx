import { useNavigate } from "react-router-dom";
import styles from "./DeniedAccess.module.css";

function DeniedAccess() {
    const navigate = useNavigate();

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <h1>Access Denied</h1>

                <p>
                    You do not have permission to access this page.
                </p>

                <button onClick={() => navigate("/app/dashboard")}>
                    Return to Dashboard
                </button>
            </section>
        </main>
    );
}

export default DeniedAccess;