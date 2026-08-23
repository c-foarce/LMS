function StudentCourseCard({ course, onSubmitProgress }) {

    return (
        <div>
            <h3>{course.course_name}</h3>

            <p>Code: {course.course_code}</p>

            <p>Teacher: {course.teacher}</p>

            <p>Status: {course.status}</p>

            <p>Progress: {course.progress}%</p>

            {course.progress === 100 ? (
                <p>
                    Grade: {course.grade || "Awaiting grade"}
                </p>
            ) : (
                <>
                    <button
                        onClick={() => onSubmitProgress(course.id)}
                    >
                        Submit Progress
                    </button>

                    <p>
                        Grade: {course.grade || "Not graded"}
                    </p>
                </>
            )}
        </div>
    );
}

export default StudentCourseCard;