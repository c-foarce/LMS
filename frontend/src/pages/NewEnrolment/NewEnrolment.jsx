import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./NewEnrolment.module.css";

import api from '../../services/api'

function NewEnrolment() {

    const navigate = useNavigate()

    const [courseOptions, setCourseOptions] = useState([]);
    const [studentOptions, setStudentOptions] = useState([]);
    //These will capture all available students and all available courses to then populate dropdowns

    const [success, setSuccess] = useState(false) // used for ssuccessful POST, allows message and wipe of page
    const [submittingSuccess, setSubmittingSuccess] = useState(false)

    const [error, setError] = useState(null)


    const [formData, setFormData] = useState({
        student: "",
        course: ""
    });
    // Stores the values selected in the enrolment form.

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setError(null);

        api.post("/courses/enrolments/create/", formData)
            .then(() => {
                setSuccess(true);
                setSubmittingSuccess(true);

                setTimeout(() => {
                    setFormData({
                        student: "",
                        course: ""
                    });

                    setSuccess(false);
                    setSubmittingSuccess(false);
                }, 3000);
            })
            .catch(error => {
                setError(
                    error.response?.data?.detail ||
                    error.response?.data?.non_field_errors?.[0] ||
                    "Could not create enrolment."
                );

                setSubmittingSuccess(true);

                setTimeout(() => {
                    setError(null);
                    setSubmittingSuccess(false);
                }, 2000);
            });
    };


    useEffect(() => {

        const fetchData = async () => {

            try {

                const studentsResponse = await api.get('/accounts/students/');
                const coursesResponse = await api.get('/courses/available/');

                setStudentOptions(studentsResponse.data)
                setCourseOptions(coursesResponse.data)

            } catch {
                setError("Failed to load students and courses.");
            }


        };

        fetchData()

    }, []);

    return (
        <div className={styles.page}>
            <button
                className={styles.back}
                type="button"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className={styles.card}>
                <h1>New Enrolment</h1>



                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.field}>
                        <label htmlFor="student">
                            Student:
                        </label>

                        <select
                            id="student"
                            name="student"
                            value={formData.student || ""}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select a student:
                            </option>

                            {studentOptions.map(student => (
                                <option
                                    key={student.id}
                                    value={student.id}
                                >
                                    {student.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="course">
                            Course:
                        </label>

                        <select
                            id="course"
                            name="course"
                            value={formData.course || ""}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select a course:
                            </option>

                            {courseOptions.map(course => (
                                <option
                                    key={course.id}
                                    value={course.id}
                                >
                                    {course.subject_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            disabled={submittingSuccess}
                        >
                            {submittingSuccess
                                ? error
                                    ? "Creation Failed"
                                    : "Enrolment Created"
                                : "Create Enrolment"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>

                        {success && (
                            <span className={styles.success}>
                                Enrolment successfully created!
                            </span>
                        )}

                        {error && (
                            <span className={styles.error}>
                                {error}
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )


}

export default NewEnrolment