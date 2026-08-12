import { useEffect, useState } from "react";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

import EnrolmentCard from "../../components/DisplayCards/EnrolmentCard";

function EnrolmentList() {

    const { user } = useAuth() //needed?

    const [enrolments, setEnrolments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const handleDelete = async (enrolmentId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this enrolment?"
        )

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/courses/enrolments/${enrolmentId}/delete/`
            )

            setEnrolments(previousEnrolments =>
                previousEnrolments.filter(
                    enrolment => enrolment.id !== enrolmentId
                )
            )
        } catch (error) {
            console.error(error)
            setError("Could not delete enrolment.")
        }
    }

    useEffect(() => {
        const fetchEnrolments = async () => {

            try {
                const response = await api.get("/courses/enrolments/all/");

                console.log("response data TESTING", response.data);

                setEnrolments(response.data);
            } catch (error) {

                console.error(error);
                setError("Could not load enrolments");
            } finally {
                setLoading(false)
            }
        };

        fetchEnrolments()
    }, []);

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <>
            <h1>All Enrolments</h1>

            {error && (
                <p>{error}</p>
            )}

            {enrolments.length === 0 ? (
                <p>No enrolments found.</p>
            ) : (
                enrolments.map(enrolment => (
                    <EnrolmentCard
                        key={enrolment.id}
                        enrolment={enrolment}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </>
    )
}

export default EnrolmentList