
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import styles from "./Completion.module.css"

function Completion() {

    const navigate = useNavigate()

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorEnrolmentId, setErrorEnrolmentId] = useState(null);

    const [success, setSuccess] = useState(null);
    const [successEnrolmentId, setSuccessEnrolmentId] = useState(null);


    useEffect(() => {

        const fetchCompleted = async () => {

            try {

                const response = await api.get(
                    "/courses/enrolments/me/"
                );

                const completed = response.data.filter(
                    enrolment =>
                        enrolment.progress === 100 &&
                        enrolment.grade
                );

                setItems(completed);

            } catch (error) {

                setError(
                    "Failed to retrieve completed courses."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchCompleted();

    }, []);


    const handleAcknowledgeCompletion = async (enrolmentId) => {

        const confirmed = window.confirm(
            "Are you sure you want to acknowledge this course as complete?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError(null);
            setErrorEnrolmentId(null);

            // Completion acknowledged
            await api.patch(
                `/courses/enrolments/${enrolmentId}/acknowledge/`
            );

            // Archive + delete
            await api.post(
                `/courses/enrolments/${enrolmentId}/complete/`
            );

            // Identify which enrolment was processed
            setSuccessEnrolmentId(enrolmentId);
            setSuccess(
                "Course has been successfully completed and archived."
            );

            setTimeout(() => {

                setSuccess(null);
                setSuccessEnrolmentId(null);

                setItems(previousItems =>
                    previousItems.filter(
                        item => item.id !== enrolmentId
                    )
                );

            }, 2000);

        } catch (error) {

            setErrorEnrolmentId(enrolmentId);

            setError(
                error.response?.data?.detail ||
                "Something went wrong when completing the course."
            );

            setTimeout(() => {

                setError(null);
                setErrorEnrolmentId(null);

            }, 3000);
        }
    };

    const fieldLabels = {
        course_name: "Course",
        course_code: "Code",
        teacher: "Teacher",
        grade: "Grade",
    };

    const fields = [
        "course_name",
        "course_code",
        "teacher",
        "grade",
    ];

    const renderField = (field, item) => {
        return (
            <span>
                {field === "grade"
                    ? item[field] || "Awaiting grade"
                    : item[field]
                }
            </span>
        );
    };


    if (loading) {
        return (
            <main className={styles.page}>
                <p className={styles.statusMessage}>Loading completed courses...</p>
            </main>
        );
    }

    return (
        <div className={styles.page}>
            <button
                type="button"
                className={styles.back}
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <h1>Course Completion</h1>

            {error && errorEnrolmentId === null && (
                <p className={styles.error}>
                    {error}
                </p>
            )}

            {items.length === 0 ? (
                <p>
                    You have no courses awaiting completion.
                </p>
            ) : (
                <div className={styles.list}>
                    {items.map(item => (
                        <article
                            key={item.id}
                            className={styles.card}
                        >
                            <h2 className={styles.title}>
                                {item.course_name}
                            </h2>

                            <div className={styles.details}>
                                {fields
                                    .filter(field => field !== "course_name")
                                    .map(field => (
                                        <div
                                            key={field}
                                            className={styles.detail}
                                        >
                                            <strong>
                                                {fieldLabels[field]}:
                                            </strong>

                                            <span>
                                                {renderField(field, item)}
                                            </span>
                                        </div>
                                    ))}
                            </div>

                            <p className={styles.message}>
                                Awaiting your acknowledgement.
                            </p>

                            {error && errorEnrolmentId === item.id && (
                                <p className={styles.error}>
                                    {error}
                                </p>
                            )}

                            {successEnrolmentId === item.id ? (
                                <p className={styles.success}>
                                    {success}
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleAcknowledgeCompletion(item.id)
                                    }
                                >
                                    Acknowledge Completion
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Completion;

