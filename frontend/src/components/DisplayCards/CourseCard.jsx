import RenderCard from "./RenderCard";

function CourseCard({
    course,
    role,
    onDelete,
    onToggleActive,
    onEdit,
    error,
    errorCourseId
}) {

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

    // const actions = (
    //     <>
    //         {error && errorCourseId === course.id && (
    //             <p>{error}</p>
    //         )}

    //         <button onClick={() => onDelete(course.id)}>
    //             Delete Course
    //         </button>

    //         <button onClick={() => onToggleActive(course.id)}>
    //             {course.is_active ? "Deactivate" : "Activate"}
    //         </button>

    //         <button
    //             onClick={() => onEdit(course.id)
    //             }
    //         >
    //             Edit
    //         </button>
    //     </>
    // )

    const errorMessage = error && errorCourseId === course.id && (
        <p>{error}</p>
    )

    const actions = []

    //adds buttons that only admins will be able to see
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

        actions.push(
            <button
                key="edit"
                onClick={() => onEdit(course.id)
                }
            >
                Edit
            </button>
        )
    }

    //adds buttons for students
    if (role === "student") {
        actions.push(
            <button
            key="enrol"
            onClick={()=> {/* ADD ENROL FUNCTION IN COURSELIST AND PASSPROP */}}
            >
                Enrol (Currently Dummy)
            </button>
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