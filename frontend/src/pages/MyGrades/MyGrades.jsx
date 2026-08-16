import { useEffect, useState } from "react"

import api from "../../services/api";

function MyGrades() {

    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)

    useEffect(() => {

        const fetchGrades = async () => {
            try {
                const response = await api.get(
                    "/courses/enrolments/my-grades/"
                );
                console.log("Data:", response.data);

                setGrades(response.data);

            } catch (error) {
                console.error(error);
                setError("Failed to Load grades.");
            } finally {
                setLoading(false)
            }
        }

        fetchGrades();
    }, [])

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <h1>My Grades</h1>

            {grades.length === 0 ? (
                <p>You don't have any graded courses yet.</p>
            ) : (grades.map(grade => (
                <div key={grade.id}>
                    <h2>
                        {grade.course_name} ({grade.course_code})
                    </h2>

                    <p>
                        Grade: {grade.grade}
                    </p>
                </div>
            ))

            )}

        </>
    );
}

export default MyGrades