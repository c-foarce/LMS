import RenderCard from "./RenderCard";

function CourseCard({
    course,
    role,
    onDelete,
    onToggleActive,
    onEdit,
    onEnrol,
    error,
    errorCourseId,
    enrolError,
    enrolErrorCourseId
}) {

    // DETAILS -----------------------------------------
    // Base information for all 3 roles, additional info pushed and unshifted underneath
    const details = [
        { label: "Subject", value: course.subject_name },
        { label: "Code", value: course.code },
        { label: "Teacher", value: course.teacher_name },
    ]

    if (role === "admin") {
        details.unshift({
            label: "ID",
            value: course.id
        })

        details.push({
            label: "Status",
            value: course.is_active ? "Active" : "Inactive"
        })
    }


    const errorMessage =
        error && errorCourseId === course.id && (
            <p>{error}</p>
        )

    const enrolErrorMessage =
        enrolError && enrolErrorCourseId === course.id && (
            <p>{enrolError}</p>
        )

    const actions = []


    // ACTIONS ------------------------------------
    // Admin
    if (role === "admin") {
        actions.push(
            <button
                key="delete"
                onClick={() => onDelete(course.id)}
            >
                Delete Course
            </button>
        )

        actions.push(
            <button
                key="toggle"
                onClick={() => onToggleActive(course.id)}
            >
                {course.is_active ? "Deactivate" : "Activate"}
            </button>
        )
    }

    // Teacher + Admin
    if (role === "admin" || role === "teacher") {
        actions.push(
            <button
                key="edit"
                onClick={() => onEdit(course.id)}
            >
                Edit
            </button>
        )
    }

    // Student
    if (role === "student") {
        actions.push(
            <div key="enrol-action">
                <button
                    onClick={() => onEnrol(course.id)}
                >
                    Enrol
                </button>

                {enrolError && enrolErrorCourseId === course.id && (
                    <span>
                        {enrolError}
                    </span>
                )}
            </div>
        )
    }

    return (
        <RenderCard
            title={course.subject_name}
            details={details}
            actions={
                <>
                    {errorMessage}
                    {actions}
                </>
            }
        />
    )
}

export default CourseCard