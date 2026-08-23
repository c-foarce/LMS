function TeacherCourseCard({
    course,
    onToggleActive,
    onEdit
}) {

    return (
        <div>
            <h3>
                {course.subject_name}
                {course.code && ` (${course.code})`}
            </h3>

            <p>
                Status: {course.is_active ? "Active" : "Inactive"}
            </p>

            <p>
                Total Students: {course.total_students}
            </p>

            <p>
                Active Students: {course.active_students}
            </p>

            <p>
                Completed Students: {course.completed_students}
            </p>

            <p>
                Dropped Students: {course.dropped_students}
            </p>

            <div>
                <button
                    onClick={() => onToggleActive(course.id)}
                >
                    {course.is_active
                        ? "Deactivate Course"
                        : "Activate Course"
                    }
                </button>

                <button onClick={onEdit}>
                    Edit Course
                </button>
            </div>
        </div>
    );
}

export default TeacherCourseCard;