import RenderCard from "./RenderCard";

function EnrolmentCard({ enrolment }) {

    const details = [
        { label: "Course", value: enrolment.course_name },
        { label: "Code", value: enrolment.course_code },
        { label: "Teacher", value: enrolment.teacher_name },
        { label: "Status", value: enrolment.status },
        { label: "Progress", value: `${enrolment.progress}%` },
        { label: "Grade", value: enrolment.grade || "Not graded" }
    ]

    return (
        <RenderCard
            title={enrolment.student_name}
            details={details}
        />
    )
}

export default EnrolmentCard