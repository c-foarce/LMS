import { useEffect, useState } from "react";

import api from "../../services/api";

function History() {

    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const response = await api.get(
                    "/courses/enrolments/history/"
                );

                setRecords(response.data);

                console.log("History:", response.data);

            } catch (error) {

                console.error("Failed to retrieve history:", error);

                setError(
                    error.response?.data?.detail ||
                    "Failed to retrieve course history."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchHistory();

    }, []);


    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }


    return (
        <>
            <h1>Course History</h1>

            {records.length === 0 ? (

                <p>
                    No completed courses found.
                </p>

            ) : (

                records.map(record => (

                    <div key={record.id}>
                        <pre>
                            {JSON.stringify(record, null, 2)}
                        </pre>
                    </div>

                ))

            )}
        </>
    );
}

export default History;