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
    const [loadingError, setLoadingError] = useState(null)

    const [deleteError, setDeleteError] = useState(null)
    const [deleteErrorCourseId, setDeleteErrorCourseId] = useState(null)

    const [updateActiveError, setUpdateActiveError] = useState(null)
    const [updateActiveErrorCourseId, setUpdateActiveErrorCourseId] = useState(null)

    const [enrolError, setEnrolError] = useState(null)
    const [enrolErrorCourseId, setEnrolErrorCourseId] = useState(null)

    const [enrolSuccess, setEnrolSuccess] = useState(null)


    // INITIAL MOUNTING

    useEffect(() => {

        const fetchCourses = async () => {

            try {

                const response = await api.get("/courses/list/");

                setCourses(response.data)

                if (user.role === "student") {

                    const enrolmentResponse = await api.get(
                        "/courses/enrolments/me"
                    )

                    setEnrolments(enrolmentResponse.data)
                }

            } catch (error) {

                setLoadingError(
                    error.response?.data?.detail ||
                    "Could not load courses."
                )

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

            setUpdateActiveError(null)
            setUpdateActiveErrorCourseId(null)

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

            setUpdateActiveError(
                error.response?.data?.detail ||
                "Something went wrong when trying to update the course"
            )

            setUpdateActiveErrorCourseId(courseId)

            setTimeout(() => {
                setUpdateActiveError(null)
                setUpdateActiveErrorCourseId(null)
            }, 3000)
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

            setDeleteErrorCourseId(courseId)

            setDeleteError(
                error.response?.data?.detail ||
                "Could not delete Course."
            )

            setTimeout(() => {
                setDeleteError(null)
                setDeleteErrorCourseId(null)
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


            setEnrolments(previousEnrolments => [
                ...previousEnrolments,
                response.data
            ])

            setEnrolSuccess("Successfully Enrolled")

            setTimeout(() => {
                setEnrolSuccess(null)
            }, 2000);


        } catch (error) {


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

    if (loadingError) {
        return <p>{loadingError}</p>
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
                        loadingError={loadingError}
                        deleteError={deleteError}
                        deleteErrorCourseId={deleteErrorCourseId}
                        updateActiveError={updateActiveError}
                        updateActiveErrorCourseId={updateActiveErrorCourseId}
                        enrolError={enrolError}
                        enrolErrorCourseId={enrolErrorCourseId}
                    />
                ))
            )}


        </>
    )
}

export default CourseList