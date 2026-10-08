import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import styles from "./StudentDashboard.module.css"

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

            } catch (error) {

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
        <div className={styles.page}>

            <h2>My Learning</h2>


            <section className={styles.section}>
                <h3>Overview</h3>

                <div className={styles.overview}>
                    <div className={styles.summaryCard}>
                        <h4>Active Courses</h4>
                        <p className={styles.summaryCount}>
                            {activeCourses.length}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Completed Courses</h4>
                        <p className={styles.summaryCount}>
                            {completedCourses.length}
                        </p>
                    </div>
                </div>

                <div className={styles.completions}>
                    <div className={styles.completionsInfo}>
                        <h3>Completions Requiring Attention</h3>

                        {awaitingCompletion.length === 0 ? (
                            <p>
                                You're all caught up. No courses need
                                completion acknowledgement.
                            </p>
                        ) : (
                            <p>
                                You have {awaitingCompletion.length}{" "}
                                course{awaitingCompletion.length === 1 ? "" : "s"}{" "}
                                waiting for your acknowledgement.
                            </p>
                        )}
                    </div>

                    {awaitingCompletion.length > 0 && (
                        <button
                            onClick={() =>
                                navigate(
                                    "/app/courses/enrolments/complete/"
                                )
                            }
                        >
                            Review Completions
                        </button>
                    )}
                </div>

            </section>



            <section className={styles.section}>

                <h3>Active Courses</h3>

                {activeCourses.length === 0 ? (
                    <p>
                        You are not currently enrolled in any active courses.
                    </p>
                ) : (
                    <div className={styles.records}>

                        {activeCourses.map(enrolment => (<div
                            key={enrolment.id}
                            className={styles.record}
                        > <h4>
                                {enrolment.course_name}
                                {enrolment.course_code &&
                                    ` (${enrolment.course_code})`
                                } </h4>

                            <p>
                                Teacher: {enrolment.teacher}
                            </p>

                            <div className={styles.progress}>
                                <div className={styles.progressLabel}>
                                    <strong>Progress:</strong>
                                    <span>{enrolment.progress}%</span>
                                </div>

                                <div
                                    className={styles.progressBar}
                                    role="progressbar"
                                    aria-label={`${enrolment.course_name} progress`}
                                    aria-valuenow={enrolment.progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${enrolment.progress}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>


                        ))}


                    </div>
                )}

            </section>


            <section className={styles.section}>

                <h3>Completed Courses</h3>

                {completedCourses.length === 0 ? (
                    <p>
                        You have not completed any courses yet.
                    </p>
                ) : (
                    <div className={styles.records}>

                        {completedCourses.map(enrolment => (
                            <div
                                key={enrolment.id}
                                className={styles.record}
                            >

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
                        ))}

                    </div>
                )}

            </section>

            <section className={styles.section}>

                <h3>Recent Grades</h3>

                {recentGrades.length === 0 ? (
                    <p>No grades yet.</p>
                ) : (
                    <div className={styles.records}>

                        {recentGrades.map(enrolment => (
                            <div
                                key={enrolment.id}
                                className={styles.record}
                            >

                                <p>
                                    <strong>{enrolment.course_name}</strong>
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
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default StudentDashboard