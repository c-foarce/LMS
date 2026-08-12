import RenderCard from "./RenderCard"

function CourseCard({ course }) {

    const details = [
        { label: "ID", value: course.id },
        { label: "Code", value: course.code },
        { label: "Teacher", value: course.teacher_name },
        {
            label: "Status",
            value: course.is_active ? "Active" : "Inactive"
        }
    ]

    return (
        <RenderCard
            title={course.subject_name}
            details={details}
        />
    )
}