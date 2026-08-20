import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'


import CourseCard from "../../components/DisplayCards/CourseCard";

function CourseList() {

    const navigate = useNavigate()

    //remove later, get working first
    const { user } = useAuth()

    const [courses, setCourses] = useState([])
    const [enrolments, setEnrolments] = useState([])

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(null)
    const [errorCourseId, setErrorCourseId] = useState(null)

    const [enrolError, setEnrolError] = useState(null)
    const [enrolErrorCourseId, setEnrolErrorCourseId] = useState(null)

    const [enrolSuccess, setEnrolSuccess] = useState(null)


    // INITIAL MOUNTING

    useEffect(() => {

        const fetchCourses = async () => {

            try {


                let endpoint = "/courses/list/"

                if (user.role === "teacher") {
                    endpoint = "/courses/teaching/"
                }

                const response = await api.get(endpoint);

                setCourses(response.data)

                if (user.role === "student") {

                    const enrolmentResponse = await api.get(
                        "/courses/enrolments/me"
                    )

                    setEnrolments(enrolmentResponse.data)
                }

            } catch (error) {

                console.error(error)

            } finally {

                setLoading(false)
            }
        };

        fetchCourses();
    }, [user.role])




    //BUTTON FUNCTIONS
    // ------------------------
    //ADMIN ONLY

    const handleEdit = (courseId) => {
        navigate(`/app/courses/${courseId}/edit/`)
    }



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

    //------------------
    //STUDENT

    const handleEnrol = async (courseId) => {

        const confirmed = window.confirm(
            "Are you sure you want to enrol in this course?"
        )

        if (!confirmed) {
            return
        }

        try {

            setEnrolError(null)
            setEnrolErrorCourseId(null)

            const response = await api.post(
                "/courses/enrolments/enrol/",
                {
                    course: courseId
                }
            )

            console.log("Enrolment created: ", response.data)

            setEnrolments(previousEnrolments => [
                ...previousEnrolments,
                response.data
            ])

            setEnrolSuccess("Successfully Enrolled")

            setTimeout(() => {
                setEnrolSuccess(null)
            }, 2000);


        } catch (error) {

            console.error("Enrolment creation failed: ", error)

            setEnrolErrorCourseId(courseId)

            setEnrolError(
                error.response?.data.detail ||
                "Could not enrol in this course"
            )

            setTimeout(() => {
                setEnrolError(null)
                setEnrolErrorCourseId(null)
            }, 2000);
        }
    }


    const enrolledCourseIds = enrolments.map(
        enrolment => enrolment.course
    )

    let displayedCourses = courses

    if (user.role === "student") {
        displayedCourses = courses.filter(
            course =>
                course.is_active &&
                !enrolledCourseIds.includes(course.id)
        )
    }

    if (loading) {
        return <p>Loading...</p>
    }
    return (
        <>
            <h1>
                Course List
            </h1>

            {enrolSuccess && (
                <p>{enrolSuccess}</p>
            )}

            {displayedCourses.length === 0 ? (
                <p>
                    {user.role === "student"
                        ? "There are currently no courses available to enrol on."
                        : "No courses found."
                    }
                </p>
            ) : (
                displayedCourses.map(course => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        role={user.role}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onEdit={handleEdit}
                        onEnrol={handleEnrol}
                        error={error}
                        errorCourseId={errorCourseId}
                        enrolError={enrolError}
                        enrolErrorCourseId={enrolErrorCourseId}
                    />
                ))
            )}


        </>
    )
}

export default CourseList