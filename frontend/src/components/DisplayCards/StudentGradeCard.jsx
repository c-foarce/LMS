function StudentGradeCard({
    student,
    editing,
    selectedGrade,
    onEdit,
    onGradeChange,
    onSave,
    onCancel,
}) {

    const gradeOptions = ["A", "B", "C", "D", "F"]

    return (

        <div>

            <p>
                Student: {student.student_name}
            </p>

            <p>

                {student.grade ? (

                    <>
                        Grade: {student.grade}

                        {!editing && (
                            <button
                                onClick={onEdit}
                            >
                                Change Grade
                            </button>
                        )}

                        {editing && (
                            <>
                                <select
                                    value={selectedGrade || ""}
                                    onChange={(event) =>
                                        onGradeChange(event.target.value)
                                    }
                                >
                                    <option value="" disabled>
                                        Select grade
                                    </option>

                                    {gradeOptions.map(grade => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>

                                {selectedGrade && (
                                    <button
                                        onClick={onSave}
                                    >
                                        Save Grade
                                    </button>
                                )}

                                <button
                                    onClick={onCancel}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </>

                ) : (

                    <>
                        Grade: Awaiting grade

                        <select
                            value={selectedGrade || ""}
                            onChange={(event) =>
                                onGradeChange(event.target.value)
                            }
                        >
                            <option value="" disabled>
                                Select grade
                            </option>

                            {gradeOptions.map(grade => (
                                <option key={grade} value={grade}>
                                    {grade}
                                </option>
                            ))}
                        </select>

                        {selectedGrade && (
                            <button
                                onClick={onSave}
                            >
                                Save Grade
                            </button>
                        )}
                    </>

                )}

            </p>

            <p>-----</p>

        </div>
    )
}

export default StudentGradeCard