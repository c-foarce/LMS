import { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

import styles from "./EditCourse.module.css";

function EditCourse() {

    const navigate = useNavigate();

    // stores the id of the course being asked for by extracting it from the URL
    const { id } = useParams();
    const { user } = useAuth();

    // gets current course data
    const [formData, setFormData] = useState({});

    // stores available teachers for dropdowns
    const [teacherOptions, setTeacherOptions] = useState([]);

    const [fields, setFields] = useState([]);

    // used for feedback after successful patch
    const [success, setSuccess] = useState(false);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);


    // get existing course and dynamic form information
    useEffect(() => {

        const fetchData = async () => {

            try {

                const [courseResponse, fieldsResponse] = await Promise.all([
                    api.get(`/courses/${id}/`),
                    api.get("/courses/course-fields/")
                ]);

                setFormData(courseResponse.data);
                setFields(fieldsResponse.data.fields);
                setTeacherOptions(fieldsResponse.data.teacher_options || []);

            } catch (error) {

                setError(
                    error.response?.data?.detail ||
                    error.message ||
                    "Failed to load course."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchData();

    }, [id]);


    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError(null);
        setSuccess(false);
        setUpdating(true);

        try {

            const response = await api.patch(
                `/courses/${id}/edit/`,
                formData
            );

            setFormData(response.data);
            setSuccess(true);
            setUpdating(false);

            setTimeout(() => {
                navigate(-1);
            }, 2000);

        } catch (error) {

            setError(
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                error.message ||
                "Failed to update course."
            );

            setUpdating(false);
        }
    };


    const handleDelete = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmed) {
            return;
        }

        setError(null);
        setDeleting(true);

        try {

            await api.delete(`/courses/${id}/delete/`);

            setDeleted(true);
            setDeleting(false);

            setTimeout(() => {
                navigate(-1);
            }, 2000);

        } catch (error) {

            setDeleting(false);

            setError(
                error.response?.data?.detail ||
                "Could not delete course."
            );
        }
    };


    const fieldLabels = {
        subject_name: "Subject Name",
        code: "Course Code",
        description: "Description",
        teacher: "Teacher",
        total_submissions: "Required Submissions",
    };


    const renderField = (field) => {

        if (field.name === "teacher" && user.role === "admin") {
            return (
                <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                >
                    <option value="">
                        Select teacher:
                    </option>

                    {teacherOptions.map((teacher) => (
                        <option
                            key={teacher.id}
                            value={teacher.id}
                        >
                            {teacher.username}
                        </option>
                    ))}
                </select>
            );
        }


        if (field.widget === "textarea") {
            return (
                <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                />
            );
        }


        return (
            <input
                id={field.name}
                type={field.widget}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
            />
        );
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

                <h1>Edit Course</h1>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >

                    {fields.map((field) => {

                        // teachers cannot edit teacher assignment
                        if (
                            field.name === "teacher" &&
                            user.role === "teacher"
                        ) {
                            return null;
                        }

                        return (
                            <div
                                className={styles.field}
                                key={field.name}
                            >
                                <label htmlFor={field.name}>
                                    {fieldLabels[field.name] || field.name}:
                                </label>

                                {renderField(field)}
                            </div>
                        );

                    })}

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
                            Course updated successfully!
                        </p>
                    )}

                </form>

            </section>

            <section className={styles.deleteSection}>

                {deleted ? (
                    <p className={styles.success}>
                        Course deleted successfully.
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
                            : "Delete Course"
                        }
                    </button>
                )}

            </section>

        </main>
    );
}

export default EditCourse;