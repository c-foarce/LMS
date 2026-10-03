import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from '../../services/api'

function NewEnrolment() {

    const navigate = useNavigate()

    const [courseOptions, setCourseOptions] = useState([]);
    const [studentOptions, setStudentOptions] = useState([]);
    //These will capture all available students and all available courses to then populate dropdowns

    const [success, setSuccess] = useState(false) // used for ssuccessful POST, allows message and wipe of page
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
        event.preventDefault()

        setError(null)

        api.post("/courses/enrolments/create/", formData)
            .then(response => {

                setSuccess(true);

                setTimeout(() => {
                    setFormData({
                        student: "",
                        course: ""
                    });

                    setSuccess(false)
                }, 3000)
            })
            .catch(error => {

                setError(
                    error.response?.data?.non_field_errors?.[0] ||
                    error.response?.data?.detail ||
                    "Could not create enrolment."
                )

                setTimeout(() => {
                    setError(null)
                }, 2000);
            })
    }

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
        <>
            <div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
            </div>
            <h1>New Enrolment</h1>
            {success && (
                <p>Enrolment sucessfully created!</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleSubmit}>
                <label htmlFor="student">Student</label>

                <select
                    id="student"
                    name="student"
                    value={formData.student || ""}
                    onChange={handleChange}
                >
                    <option value="">Select a student:</option>

                    {studentOptions.map(student => {
                        return (
                            <option key={student.id} value={student.id}>
                                {student.username}
                            </option>
                        )
                    })}
                </select>

                <label htmlFor="course">Course</label>

                <select
                    id="course"
                    name="course"
                    value={formData.course || ""}
                    onChange={handleChange}
                >
                    <option value="">Select a course:</option>

                    {courseOptions.map(course => {
                        return (
                            <option key={course.id} value={course.id}>
                                {course.subject_name}
                            </option>
                        )
                    })}
                </select>

                <div>
                    <button type="submit">
                        Create Enrolment
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </>
    )


}

export default NewEnrolment