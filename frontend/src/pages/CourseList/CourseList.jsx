import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

function CourseList() {

    const navigate = useNavigate()

    //remove later, get working first
    const { user } = useAuth()

    const [courses, setCourses] = useState([])

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(null)
    const [errorCourseId, setErrorCourseId] = useState(null)


    // INITIAL MOUNTING

    useEffect(() => {

        const fetchCourses = async () => {

            try {

                const response = await api.get("/courses/list/");

                setCourses(response.data)

            } catch (error) {

                console.error(error)

            } finally {

                setLoading(false)
            }
        };

        fetchCourses();
    }, [])




    //BUTTON FUNCTIONS

    const handleToggleActive = async (courseId) => {

        try {

            setError(null)

            const response = await api.patch(
                `/courses/${courseId}/toggle-active/`
            )

            setCourses(prevCourses =>
                prevCourses.map(course =>
                    course.id === response.data.id
                        ? response.data
                        : course
                )
            )

        } catch (error) {

            console.error("SUBMIT ERROR:", error)

            setError(
                error.response?.data?.detail ||
                "Something went wrong when trying to process the request"
            )

            setTimeout(() => {
                setError(null)

            }, 3000);

        }
    }


    const handleDelete = async (courseId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        )

        if (!confirmed) {
            return
        }

        try {

            await api.delete(
                `/courses/${courseId}/delete/`
            )

            setCourses(previousCourses =>
                previousCourses.filter(
                    course => course.id !== courseId
                )
            )

        } catch (error) {

            console.error(error)

            setErrorCourseId(courseId)

            setError(
                error.response?.data?.detail ||
                "Could not delete Course."
            )

            setTimeout(() => {
                setError(null)
                setErrorCourseId(null)
            }, 3000)
        }
    }


    //EXTRACT COURSELIST FROM COURSES <<<---, THEN ALL CREATOIN/EDITING IS ADMIN CONTROLLED

    if (loading) {
        return <p>Loading...</p>
    }
    return (
        <>
            <h1>
                Course List
            </h1>
            {/* TODO: Extract course rendering into reusable CourseCard component */}
            {courses.map(course => (
                <div key={course.id}>
                    <p>ID: {course.id}</p>
                    <p>Subject: {course.subject_name}</p>
                    <p>Code: {course.code}</p>
                    <p>Teacher: {course.teacher_name}</p>
                    <p>Status: {course.is_active ? "Active" : "Inactive"}</p>

                    {error && errorCourseId === course.id && (
                        <p>{error}</p>
                    )}

                    <button onClick={() => handleDelete(course.id)}>Delete Course</button>
                    <button onClick={() => handleToggleActive(course.id)}>{course.is_active ? "Deactivate" : "Activate"}</button>
                <button onClick={() => navigate(`/app/courses/${course.id}/edit/`)}>Edit</button>
                </div>
            ))}


        </>
    )
}

export default CourseList