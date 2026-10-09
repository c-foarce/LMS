import { useEffect, useState } from "react";

import { useAuth } from '../../context/AuthContext';

import api from '../../services/api';

import styles from "./EnrolmentList.module.css";

import SearchAndFilter from "../../components/Filters/SearchAndFilter";

import EnrolmentCard from "../../components/EnrolmentCards/EnrolmentCard";

function EnrolmentList() {

    const { user } = useAuth()

    const [enrolments, setEnrolments] = useState([])


    const [loading, setLoading] = useState(true)
    const [loadingError, setLoadingError] = useState(null)


    const [deleteError, setDeleteError] = useState(null)
    const [deleteErrorEnrolmentId, setDeleteErrorEnrolmentId] = useState(null)

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");



    useEffect(() => {
        const fetchEnrolments = async () => {

            try {
                const response = await api.get("/courses/enrolments/all/");


                setEnrolments(response.data);
            } catch (error) {

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


    const filteredEnrolments = enrolments.filter(enrolment => {
        const searchTerm = search.toLowerCase();

        const matchesSearch =
            enrolment.student_name?.toLowerCase().includes(searchTerm) ||
            enrolment.course_name?.toLowerCase().includes(searchTerm) ||
            enrolment.course_code?.toLowerCase().includes(searchTerm) ||
            enrolment.teacher?.toLowerCase().includes(searchTerm);

        const matchesStatus =
            !statusFilter ||
            enrolment.status === statusFilter;

        const matchesGrade =
            !gradeFilter ||
            (gradeFilter === "graded" && Boolean(enrolment.grade)) ||
            (gradeFilter === "ungraded" && !enrolment.grade);

        return (
            matchesSearch &&
            matchesStatus &&
            matchesGrade
        );
    });

    if (loading) {
        return <p>Loading...</p>
    }

    if (loadingError) {
        return <p>{loadingError}</p>
    }

    return (
        <div className={styles.page}>
            <h1>All Enrolments</h1>

            <SearchAndFilter
                search={search}
                onSearchChange={setSearch}
                searchLabel="Search:"
                searchPlaceholder="Search enrolments..."
                filters={[
                    {
                        id: "status-filter",
                        label: "Status:",
                        column: "left",
                        value: statusFilter,
                        onChange: setStatusFilter,
                        defaultLabel: "All Statuses",
                        options: [
                            { value: "ACTIVE", label: "Active" },
                            { value: "COMPLETED", label: "Completed" },
                        ],
                        getValue: status => status.value,
                        getLabel: status => status.label,
                    },
                    {
                        id: "grade-filter",
                        label: "Grade:",
                        column: "right",
                        value: gradeFilter,
                        onChange: setGradeFilter,
                        defaultLabel: "All",
                        options: [
                            { value: "graded", label: "Graded" },
                            { value: "ungraded", label: "Not Graded" },
                        ],
                        getValue: option => option.value,
                        getLabel: option => option.label,
                    },
                ]}
                onClear={() => {
                    setSearch("");
                    setStatusFilter("");
                    setGradeFilter("");
                }}
            />

            {filteredEnrolments.length === 0 ? (
                <p>
                    {enrolments.length === 0
                        ? "No enrolments found."
                        : "No enrolments match your search or filters."
                    }
                </p>
            ) : (
                <div className={styles.grid}>
                    {filteredEnrolments.map(enrolment => (
                        <EnrolmentCard
                            key={enrolment.id}
                            role={user.role}
                            enrolment={enrolment}
                            onDelete={handleDelete}
                            deleteError={deleteError}
                            deleteErrorEnrolmentId={deleteErrorEnrolmentId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default EnrolmentList