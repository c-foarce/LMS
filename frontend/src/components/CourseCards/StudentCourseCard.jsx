import RenderCard from "../Cards/RenderCard";
import styles from "./CourseCards.module.css";

function StudentCourseCard({ course, onSubmitProgress, success, isSubmittingSuccess }) {

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

    if (course.progress !== 100 || isSubmittingSuccess) {
        actions.push(
            <div key="submit-progress" className={styles.submitAction}>
                <button
                    disabled={isSubmittingSuccess}
                    onClick={() => onSubmitProgress(course.id)}
                >
                    {isSubmittingSuccess ? "Progress Submitted" : "Submit Progress"}
                </button>

                {success && (
                    <p className={styles.success}>
                        {success}
                    </p>
                )}
            </div>
        );
    }

    return (
        <RenderCard
            title={course.course_name}
            details={details}
            actions={actions}
            message={
                success
                    ? { type: "success", text: success }
                    : null
            }
        />
    );
}

export default StudentCourseCard;