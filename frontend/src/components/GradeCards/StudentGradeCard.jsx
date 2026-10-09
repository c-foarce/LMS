import RenderCard from "../Cards/RenderCard";
import styles from "./StudentGradeCard.module.css";

function StudentGradeCard({
    student,
    editing,
    selectedGrade,
    onEdit,
    onGradeChange,
    onSave,
    onCancel,
}) {
    const gradeOptions = ["A", "B", "C", "D", "F"];

    const gradeSelector = (
        <select
            className={styles.gradeSelect}
            value={selectedGrade || ""}
            onChange={(event) => onGradeChange(event.target.value)}
            aria-label={`Select grade for ${student.student_name}`}
        >
            <option value="" disabled>
                Select grade
            </option>

            {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                    {grade}
                </option>
            ))}
        </select>
    );

    const actions = student.grade ? (
        editing ? (
            <>
                {gradeSelector}

                {selectedGrade && (
                    <button type="button" onClick={onSave}>
                        Save Grade
                    </button>
                )}

                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </>
        ) : (
            <button type="button" onClick={onEdit}>
                Change Grade
            </button>
        )
    ) : (
        <>
            {gradeSelector}

            {selectedGrade && (
                <button type="button" onClick={onSave}>
                    Save Grade
                </button>
            )}
        </>
    );

    return (
        <RenderCard
            title={student.student_name}
            details={[
                {
                    label: "Grade",
                    value: student.grade || "Awaiting grade",
                },
            ]}
            actions={actions}
        />
    );
}

export default StudentGradeCard;