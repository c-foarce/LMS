import { createContext, useContext, useEffect, useState } from "react";
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token) {
            setLoading(false);
            return;
        }

        api.get("/accounts/user-role/")
        .then(response => {
            setUser(response.data);
        })
        .catch(() => {
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value = {{ user, setUser, loading}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext)
}