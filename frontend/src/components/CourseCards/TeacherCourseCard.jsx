import RenderCard from "../Cards/RenderCard";

import styles from "./CourseCards.module.css";

function TeacherCourseCard({
    course,
    onToggleActive,
    onEdit
}) {

    const details = [
        {
            label: "Status",
            value: (
                <span
                    className={
                        course.is_active
                            ? styles.active
                            : styles.inactive
                    }
                >
                    {course.is_active ? "Active" : "Inactive"}
                </span>
            )
        },
        {
            label: "Total Students",
            value: course.total_students
        },
        {
            label: "Active Students",
            value: course.active_students
        },
        {
            label: "Completed Students",
            value: course.completed_students
        }
    ];

    const actions = [
        <button
            key="toggle"
            onClick={() => onToggleActive(course.id)}
        >
            {course.is_active
                ? "Deactivate Course"
                : "Activate Course"
            }
        </button>,

        <button
            key="edit"
            onClick={onEdit}
        >
            Edit Course
        </button>
    ];

    return (
        <RenderCard
            title={`${course.subject_name}${course.code ? ` (${course.code})` : ""}`}
            details={details}
            actions={actions}
        />
    );
}

export default TeacherCourseCard;