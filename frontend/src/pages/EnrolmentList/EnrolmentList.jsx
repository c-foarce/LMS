import { useEffect, useState } from "react";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

import EnrolmentCard from "../../components/DisplayCards/EnrolmentCard";

function EnrolmentList() {

    const { user } = useAuth()

    const [enrolments, setEnrolments] = useState([])


    const [loading, setLoading] = useState(true)
    const [loadingError, setLoadingError] = useState(null)


    const [deleteError, setDeleteError] = useState(null)
    const [deleteErrorEnrolmentId, setDeleteErrorEnrolmentId] = useState(null)



    useEffect(() => {
        const fetchEnrolments = async () => {

            try {
                const response = await api.get("/courses/enrolments/all/");


                setEnrolments(response.data);
            } catch (error) {

                // console.error(error);
                setLoadingError("Could not load enrolments");
            } finally {
                setLoading(false)
            }
        };

        fetchEnrolments()
    }, []);

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
            // console.error(error)
            setDeleteErrorEnrolmentId(enrolmentId)

            setDeleteError(
                error.response?.data?.detail ||
                "Could not delete enrolment."
            )

            setTimeout(() => {
                setDeleteError(null)
                setDeleteErrorEnrolmentId(null)
            }, 2000);
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }

    if (loadingError) {
        return <p>{loadingError}</p>
    }

    return (
        <>
            <h1>All Enrolments</h1>

            {enrolments.length === 0 ? (
                <p>No enrolments found.</p>
            ) : (
                enrolments.map(enrolment => (
                    <EnrolmentCard
                        key={enrolment.id}
                        role={user.role}
                        enrolment={enrolment}
                        onDelete={handleDelete}
                        deleteError={deleteError}
                        deleteErrorEnrolmentId={deleteErrorEnrolmentId}
                    />
                ))
            )}
        </>
    )
}

export default EnrolmentList