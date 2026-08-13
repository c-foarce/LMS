import RenderCard from "./RenderCard";

function EnrolmentCard({ enrolment, role, onDelete }) {

    const details = [
        { label: "Course", value: enrolment.course_name },
        { label: "Code", value: enrolment.course_code },
        { label: "Teacher", value: enrolment.teacher || "N/A" },
        { label: "Status", value: enrolment.status },
        { label: "Progress", value: `${enrolment.progress}%` },
        { label: "Grade", value: enrolment.grade || "Not graded" }
    ]

    // const actions = (
    //     <button onClick={() => onDelete(enrolment.id)}>
    //         Delete
    //     </button>
    // )
    const actions = []

    actions.push(
        <button
            key="delete-enrolment"
            onClick={() => onDelete(enrolment.id)}
        >
            Delete
        </button>
    )



    // console.log("EnrolmentCard:", enrolment)

    return (
        <RenderCard
            title={enrolment.student_name + " - " + enrolment.course_code}
            details={details}
            actions={actions}
        />
    )
}

export default EnrolmentCard