import RenderCard from "./RenderCard";

function CourseCard({
    course,
    role,
    onDelete,
    onToggleActive,
    onEdit,
    onEnrol,
    deleteError,
    deleteErrorCourseId,
    updateActiveError,
    updateActiveErrorCourseId,
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

    if (role === "student") {
        details.push({
            label: "Required Submissions",
            value: course.total_submissions,
        })
    }

    const actions = []


    // ACTIONS ------------------------------------
    // Admin
    if (role === "admin") {
        actions.push(
            <div key="delete-action">
                <button
                    key="delete"
                    onClick={() => onDelete(course.id)}
                >
                    Delete Course
                </button>

                {deleteError && deleteErrorCourseId === course.id && (
                    <span>
                        {deleteError}
                    </span>
                )}

            </div>
        )

        actions.push(
            <div key="update-action">
                <button
                    key="toggle"
                    onClick={() => onToggleActive(course.id)}
                >
                    {course.is_active ? "Deactivate" : "Activate"}
                </button>

                {updateActiveError && updateActiveErrorCourseId === course.id && (
                    <span>
                        {updateActiveError}
                    </span>
                )}

            </div>
        )
    }

    // Teacher + Admin
    if (role === "admin") {
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
                    {actions}
                </>
            }
        />
    )
}

export default CourseCard