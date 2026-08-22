import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

function EditUser() {

    const navigate = useNavigate()

    const { user: currentUser } = useAuth()
    const { id } = useParams();

    const isSelf = currentUser?.id === Number(id)

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);


    useEffect(() => {

        const fetchUser = async () => {

            try {

                const response = await api.get(
                    `/accounts/users/${id}/`
                );

                setUser(response.data);

            } catch (error) {

                console.error("Failed to retrieve user:", error);

                setError(
                    error.response?.data?.detail ||
                    "Failed to retrieve user."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchUser();

    }, [id]);

    const handleDelete = async () => {

        console.log("DEL USER ID:", id);

        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeleting(true);

            await api.delete(`/accounts/${id}/delete/`);

            setDeleted(true);

            setTimeout(() => {
                navigate("/app/accounts/all/");
            }, 2000);

        } catch (error) {

            console.error(error);

            setDeleting(false);
            setError("Could not delete user.");

        }
    };


    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }


    return (
        <>
            <div>

                <h1>Edit User</h1>

                <p>Username: {user.username}</p>

                <p>First Name: {user.first_name}</p>

                <p>Last Name: {user.last_name}</p>

                <p>Role: {user.role}</p>

            </div>

            <div>
                {!isSelf && (
                    deleted ? (
                        <p>User deleted successfully.</p>
                    ) : (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete User"}
                        </button>
                    )
                )}
            </div>

            <pre>
                {JSON.stringify(user, null, 2)}
            </pre>
        </>
    );
}

export default EditUser;