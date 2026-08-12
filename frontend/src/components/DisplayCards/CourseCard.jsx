import RenderCard from "./RenderCard";

function CourseCard({
    course,
    onDelete,
    onToggleActive,
    onEdit,
    error,
    errorCourseId
}) {

    const details = [
        { label: "ID", value: course.id },
        { label: "Subject", value: course.subject_name },
        { label: "Code", value: course.code },
        { label: "Teacher", value: course.teacher_name },
        {
            label: "Status",
            value: course.is_active ? "Active" : "Inactive"
        }
    ]

    const actions = (
        <>
            {error && errorCourseId === course.id && (
                <p>{error}</p>
            )}

            <button onClick={() => onDelete(course.id)}>
                Delete Course
            </button>

            <button onClick={() => onToggleActive(course.id)}>
                {course.is_active ? "Deactivate" : "Activate"}
            </button>

            <button
                onClick={() => onEdit(course.id)
                }
            >
                Edit
            </button>
        </>
    )

    return (
        <RenderCard
            title={course.subject_name}
            details={details}
            actions={actions}
        />
    )
}

export default CourseCard