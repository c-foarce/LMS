import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

import styles from "./EditUser.module.css";

function EditUser() {

    const navigate = useNavigate();

    const { user: currentUser } = useAuth();
    const { id } = useParams();

    const isSelf = currentUser?.id === Number(id);

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [success, setSuccess] = useState(null);
    const [updating, setUpdating] = useState(false);

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
                    confirm_password: "",
                });

            } catch (error) {

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
        }));
    };


    const fields = [
        {
            name: "username",
            type: "text",
        },
        {
            name: "first_name",
            type: "text",
        },
        {
            name: "last_name",
            type: "text",
        },
        {
            name: "password",
            type: "password",
            placeholder: "Leave blank to keep current password",
        },
        {
            name: "confirm_password",
            type: "password",
            placeholder: "Repeat new password",
        },
    ];


    const fieldLabels = {
        username: "Username",
        first_name: "First Name",
        last_name: "Last Name",
        password: "New Password",
        confirm_password: "Confirm New Password",
    };


    const renderField = (field) => {

        return (
            <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
            />
        );
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError(null);
        setSuccess(null);
        setUpdating(true);

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

            if (formData.password) {
                dataToSend.password = formData.password;
            }

            await api.patch(
                `/accounts/users/${id}/edit/`,
                dataToSend
            );

            setSuccess("User updated successfully!");
            setUpdating(false);

            setTimeout(() => {
                navigate("/app/accounts/all/");
            }, 2000);

        } catch (error) {

            setError(
                error.response?.data?.detail ||
                "Failed to update user."
            );

            setUpdating(false);
        }
    };


    const handleDelete = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) {
            return;
        }

        setError(null);
        setDeleting(true);

        try {

            await api.delete(`/accounts/${id}/delete/`);

            setDeleted(true);
            setDeleting(false);

            setTimeout(() => {
                navigate("/app/accounts/all/");
            }, 2000);

        } catch (error) {

            setDeleting(false);
            setError(
                error.response?.data?.detail ||
                "Could not delete user."
            );
        }
    };


    if (loading) {
        return <p>Loading...</p>;
    }


    if (error) {
        return <p>{error}</p>;
    }


    return (
        <main className={styles.page}>

            <button
                className={styles.back}
                type="button"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <section className={styles.card}>

                <h1>
                    Edit {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </h1>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >

                    {fields.map((field) => (
                        <div
                            className={styles.field}
                            key={field.name}
                        >
                            <label htmlFor={field.name}>
                                {fieldLabels[field.name]}:
                            </label>

                            {renderField(field)}
                        </div>
                    ))}

                    {error && (
                        <p className={styles.error}>
                            {error}
                        </p>
                    )}

                    <div className={styles.actions}>

                        <button
                            type="submit"
                            disabled={updating || success}
                        >
                            {updating
                                ? "Saving..."
                                : success
                                    ? "Saved!"
                                    : "Save Changes"
                            }
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={updating}
                        >
                            Discard Changes
                        </button>

                    </div>

                    {success && (
                        <p className={styles.success}>
                            {success}
                        </p>
                    )}

                </form>

            </section>

            {!isSelf && (
                <section className={styles.deleteSection}>

                    {deleted ? (
                        <p className={styles.success}>
                            User deleted successfully.
                        </p>
                    ) : (
                        <button
                            className={styles.deleteButton}
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete User"
                            }
                        </button>
                    )}

                </section>
            )}

        </main>
    );
}

export default EditUser;
