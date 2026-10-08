import RenderCard from "../Cards/RenderCard";
import styles from "./CourseCards.module.css";

function StudentCourseCard({ course, onSubmitProgress }) {

    const details = [
        { label: "Code", value: course.course_code },
        { label: "Teacher", value: course.teacher },
        { label: "Status", value: course.status },
        {
            label: "Progress",
            value: (
                <div className={styles.progress}>
                    <span>{course.progress}%</span>

                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${course.progress}%`
                            }}
                        />
                    </div>
                </div>
            )
        },
        {
            label: "Grade",
            value: course.grade || (
                course.progress === 100
                    ? "Awaiting grade"
                    : "Not graded"
            )
        }
    ];

    const actions = [];

    if (course.progress !== 100) {
        actions.push(
            <button
                key="submit-progress"
                onClick={() => onSubmitProgress(course.id)}
            >
                Submit Progress
            </button>
        );
    }

    return (
        <RenderCard
            title={course.course_name}
            details={details}
            actions={actions}
        />
    );
}

export default StudentCourseCard;