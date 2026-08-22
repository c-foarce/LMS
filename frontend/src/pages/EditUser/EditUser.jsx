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

    const [success, setSuccess] = useState(null)
    const [updating, setUpdating] = useState(false)

    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        confirm_password: "",
    });

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const response = await api.get(
                    `/accounts/users/${id}/`
                );

                setUser(response.data);

                setFormData({
                    username: response.data.username,
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    password: "",
                });


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

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }))
    }

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError(null);
        setSuccess(null);
        setUpdating(true)

        // Password validation
        if (
            !formData.password &&
            formData.confirm_password
        ) {
            setError("Please enter a new password.");
            setUpdating(false);
            return;
        }

        if (
            formData.password &&
            formData.password !== formData.confirm_password
        ) {
            setError("Passwords do not match.");
            setUpdating(false);
            return;
        }

        try {

            const dataToSend = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
            };

            // Only send password if the admin actually entered one
            if (formData.password) {
                dataToSend.password = formData.password;
            }

            await api.patch(
                `/accounts/users/${id}/edit/`,
                dataToSend
            );

            setUpdating(true)
            setSuccess("User updated successfully!")

            setTimeout(() => {
                navigate("/app/accounts/all/");
            }, 2000);


        } catch (error) {

            console.error("Failed to update user:", error);

            setError(
                error.response?.data?.detail ||
                "Failed to update user."
            );

            setUpdating(false);
        }
    };

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

                <form onSubmit={handleSubmit}>

                    <div>
                        <label htmlFor="username">
                            Username:
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="first_name">
                            First Name:
                        </label>

                        <input
                            id="first_name"
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="last_name">
                            Last Name:
                        </label>

                        <input
                            id="last_name"
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">
                            New Password:
                        </label>

                        <input
                            id="password"
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm_password">
                            Confirm New Password:
                        </label>

                        <input
                            id="confirm_password"
                            type="text"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Repeat new password"
                        />
                    </div>

                    <p>Role: {user.role}</p>

                    <div>
                        <button
                            type="submit"
                            disabled={updating}
                        >
                            {updating ? "Saving..." : "Save Changes"}
                        </button>

                        {success && (
                            <span>
                                {success}
                            </span>
                        )}
                    </div>

                </form>

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