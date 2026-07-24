import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";


// Creates billboard for all the important parts of user login 
const AuthContext = createContext();

export function AuthProvider({ children }) {

    // Stores the currently logged-in user.
    // Starts as null until token verification
    const [user, setUser] = useState(null);

    // Prevents the app from rendering protected pages
    // until login success.
    const [loading, setLoading] = useState(true);

    // Runs on start
    useEffect(() => {

        // Look for a saved JWT access token.
        const token = localStorage.getItem("access");

        // No token means nobody is logged in.
        if (!token) {
            setLoading(false);
            return;
        }

        // Token exists, so ask Django who it belongs to.
        api.get("/accounts/user-role/")
            .then(response => {

                // Save the authenticated user's details
                // (username, role, etc.) into global state.
                setUser(response.data);

            })
            .catch(() => {

                // Invalid or expired token.
                setUser(null);

            })
            .finally(() => {

                // Authentication check has completed.
                setLoading(false);

            });

    }, []);

    // Makes the authentication state available
    // to every component inside AuthProvider.
    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook so components can simply call:
// const { user } = useAuth();
export function useAuth() {
    return useContext(AuthContext);
}