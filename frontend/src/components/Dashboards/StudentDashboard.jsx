import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

function StudentDashboard() {

    const navigate = useNavigate()

    const [enrolments, setEnrolments] = useState([]);
    const [completedEnrolments, setCompletedEnrolments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                const [
                    enrolmentsResponse,
                    completedResponse
                ] = await Promise.all([
                    api.get("/courses/enrolments/me/"),
                    api.get("/courses/enrolments/completed/me/")
                ]);

                setEnrolments(enrolmentsResponse.data);
                setCompletedEnrolments(completedResponse.data);

                console.log("Current:", enrolmentsResponse.data);
                console.log("Completed:", completedResponse.data);

            } catch (error) {

                console.error(
                    "Failed to retrieve student dashboard data:",
                    error
                );

                setError(
                    "Failed to retrieve student dashboard data."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchDashboardData();

    }, []);


    const activeCourses = enrolments.filter(
        enrolment => enrolment.status === "active"
    );

    const completedCourses = completedEnrolments;

    const recentGrades = [...completedCourses]
        .sort(
            (a, b) =>
                new Date(b.completed_at) - new Date(a.completed_at)
        )
        .slice(0, 5);



    const awaitingCompletion = enrolments.filter(
        enrolment =>
            enrolment.grade &&
            !enrolment.student_completed
    );


    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>{error}</p>
    }


    return (
        <div>

            <h2>My Learning</h2>

            <div>

                <h3>Overview</h3>

                <div>

                    <p>
                        Active Courses: {activeCourses.length}
                    </p>

                    <p>
                        Completed Courses: {completedCourses.length}
                    </p>

                </div>

                <div>
                    <h3>Completions</h3>

                    {awaitingCompletion.length === 0 ? (
                        <p>No Courses to mark as complete.</p>
                    ) : (
                        <button
                            onClick={() => navigate("/app/courses/enrolments/complete/")}
                        >
                            Courses Awaiting Completion
                        </button>
                    )}
                </div>

            </div>

            <div>
                <h3>Active Courses</h3>

                {activeCourses.length === 0 ? (
                    <p>You are not currently enrolled in any active courses.</p>
                ) : (
                    activeCourses.map(enrolment => (
                        <div key={enrolment.id}>

                            <h4>
                                {enrolment.course_name}
                                {enrolment.course_code &&
                                    ` (${enrolment.course_code})`
                                }
                            </h4>

                            <p>
                                Teacher: {enrolment.teacher}
                            </p>

                            <p>
                                Progress: {enrolment.progress}%
                            </p>

                        </div>
                    ))
                )}
            </div>

            <div>
                <h3>Completed Courses</h3>

                {completedCourses.length === 0 ? (
                    <p>You have not completed any courses yet.</p>
                ) : (
                    completedCourses.map(enrolment => (
                        <div key={enrolment.id}>

                            <h4>
                                {enrolment.course_name}
                                {enrolment.course_code &&
                                    ` (${enrolment.course_code})`
                                }
                            </h4>

                            <p>
                                Grade: {enrolment.grade}
                            </p>

                            <p>
                                Completed:{" "}
                                {new Date(
                                    enrolment.completed_at
                                ).toLocaleDateString()}
                            </p>

                        </div>
                    ))
                )}
            </div>

            <div>
                <h3>Current Progress</h3>

                {activeCourses.length === 0 ? (
                    <p>No active courses.</p>
                ) : (
                    activeCourses.map(enrolment => (
                        <div key={enrolment.id}>

                            <p>
                                {enrolment.course_name}:{" "}
                                {enrolment.progress}%
                            </p>

                        </div>
                    ))
                )}
            </div>

            <div>
                <h3>Recent Grades</h3>

                {recentGrades.length === 0 ? (
                    <p>No grades yet.</p>
                ) : (
                    recentGrades.map(enrolment => (
                        <div key={enrolment.id}>

                            <p>
                                {enrolment.course_name}
                            </p>

                            <p>
                                Grade: {enrolment.grade}
                            </p>

                            <p>
                                Completed:{" "}
                                {new Date(
                                    enrolment.completed_at
                                ).toLocaleDateString()}
                            </p>

                        </div>

                    ))
                )}

            </div>

        </div>
    );
}

export default StudentDashboard