import RenderCard from "./RenderCard";

function EnrolmentCard({
    enrolment,
    onDelete,
    deleteError,
    deleteErrorEnrolmentId }) {

    const details = [
        { label: "Course", value: enrolment.course_name },
        { label: "Code", value: enrolment.course_code },
        { label: "Teacher", value: enrolment.teacher || "N/A" },
        { label: "Status", value: enrolment.status },
        { label: "Progress", value: `${enrolment.progress}%` },
        { label: "Grade", value: enrolment.grade || "Not graded" }
    ]


    const actions = []

    actions.push(
        <div key="delete-enrolment-action">
            <button
                key="delete-enrolment"
                onClick={() => onDelete(enrolment.id)}
            >
                Delete
            </button>

            {deleteError && deleteErrorEnrolmentId === enrolment.id && (
                <span>
                    {deleteError}
                </span>
            )}
        </div>
    )

    return (
        <RenderCard
            title={enrolment.student_name + " - " + enrolment.course_code}
            details={details}
            actions={actions}
        />
    )
}

export default EnrolmentCard