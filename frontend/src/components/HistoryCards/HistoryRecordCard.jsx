import RenderCard from "../Cards/RenderCard";

function HistoryRecordCard({ record }) {


    const formattedDate = new Date(
        record.completed_at
    ).toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const details = [
        {
            label: "Code",
            value: record.course_code,
        },
        {
            label: "Student",
            value: `${record.student_first_name} ${record.student_last_name}`,
        },
        {
            label: "Teacher",
            value: record.teacher_username,
        },
        {
            label: "Grade",
            value: record.grade,
        },
        {
            label: "Completed",
            value: formattedDate,
        },
    ];

    return (
        <RenderCard
            title={record.course_name}
            details={details}
        />
    );


}

export default HistoryRecordCard;
