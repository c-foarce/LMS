import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import DeniedAccess from "./DeniedAccess";

function RoleRoute({ roles, children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!roles.includes(user.role)) {
        return <DeniedAccess />;
    }

    return children;
}

export default RoleRoute