import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

import FilterDropdown from "../../components/Filters/FilterDropdown";

import CourseCard from "../../components/DisplayCards/CourseCard";


function CourseList() {

    const navigate = useNavigate()

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

    const [search, setSearch] = useState("");
    const [teacherFilter, setTeacherFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");


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


    const teachers = [...new Set(
        courses
            .map(course => course.teacher_name)
            .filter(Boolean)
    )];

    const statuses = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
    ];


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

    const filteredCourses = displayedCourses.filter(course => {
        const searchTerm = search.toLowerCase()

        const matchesSearch =
            course.subject_name?.toLowerCase().includes(searchTerm) ||
            course.code?.toLowerCase().includes(searchTerm) ||
            course.teacher_name?.toLowerCase().includes(searchTerm)

        const matchesTeacher =
            !teacherFilter ||
            course.teacher_name === teacherFilter

        const matchesStatus =
            !statusFilter ||
            (statusFilter === "active" && course.is_active) ||
            (statusFilter === "inactive" && !course.is_active)

        return (
            matchesSearch &&
            matchesTeacher &&
            matchesStatus
        )
    })

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

            <div>
                <label htmlFor="course-search">
                    Search:
                </label>

                <input
                    id="course-search"
                    type="text"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <FilterDropdown
                    id="teacher-filter"
                    label="Teacher:"
                    value={teacherFilter}
                    onChange={setTeacherFilter}
                    defaultLabel="All Teachers"
                    options={teachers}
                    getValue={teacher => teacher}
                    getLabel={teacher => teacher}
                />

                {user.role !== "student" && (
                    <FilterDropdown
                        id="status-filter"
                        label="Status:"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        defaultLabel="All Statuses"
                        options={statuses}
                        getValue={status => status.value}
                        getLabel={status => status.label}
                    />
                )}
            </div>

            {enrolSuccess && (
                <p>{enrolSuccess}</p>
            )}
            {/*This i want moved next to the relvant button in a <span> */}

            {filteredCourses.length === 0 ? (
                <p>
                    {displayedCourses.length === 0
                        ? user.role === "student"
                            ? "There are currently no courses available to enrol on."
                            : "No courses found."
                        : "No courses match your search or filters."
                    }
                </p>
            ) : (
                filteredCourses.map(course => (
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