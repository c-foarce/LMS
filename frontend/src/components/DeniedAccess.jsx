import { useNavigate } from "react-router-dom";

function DeniedAccess() {

    const navigate = useNavigate();

    return (
        <div>
            <h1>Access Denied</h1>
            <p>
                You do not have permission to access this page.
            </p>

            <button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
            </button>
        </div>
    );
}

export default DeniedAccess;