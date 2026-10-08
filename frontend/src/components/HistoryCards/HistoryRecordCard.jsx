
function HistoryRecordCard({ record }) {

    const formattedDate = new Date(
        record.completed_at
    ).toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <div>
            <h2>{record.course_name}</h2>

            <p>Code: {record.course_code}</p>

            <p>Student: {record.student_first_name}{" "}{record.student_last_name}</p>

            <p>Teacher: {record.teacher_username}</p>

            <p>Grade: {record.grade}</p>

            <p>Completed: {formattedDate}</p>
        </div>
    )
}

export default HistoryRecordCard