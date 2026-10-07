import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import styles from "./TeacherDashboard.module.css"

function TeacherDashboard() {

    const navigate = useNavigate()


    const [progress, setProgress] = useState([]);

    const [courseStats, setCourseStats] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                const [
                    progressResponse,
                    dashboardResponse
                ] = await Promise.all([
                    api.get("/courses/teaching/progress/"),
                    api.get("/courses/teaching/dashboard/")
                ]);

                setProgress(progressResponse.data);
                setCourseStats(dashboardResponse.data);

            } catch (error) {

                setError(
                    "Failed to retrieve teacher dashboard data."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchDashboardData();

    }, []);

    const getAwaitingGrading = (courseId) => {

        const courseProgress = progress.find(
            course => course.id === courseId
        );

        if (!courseProgress) {
            return [];
        }

        return courseProgress.completed_students.filter(
            student => !student.grade
        );
    };

    const totalCourses = courseStats.length

    const totalStudents = courseStats.reduce(
        (total, course) => total + course.total_students,
        0
    );

    const awaitingGrading = progress.flatMap(
        course => course.completed_students
    ).filter(
        student => !student.grade
    );


    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <div className={styles.page}>

            <h2>My Teaching</h2>

            <section className={styles.section}>

                <h3>Overview</h3>

                <div>
                    <p>Courses Taught: {totalCourses}</p>
                    <p>Total Students: {totalStudents}</p>
                    <p>Awaiting Grading: {awaitingGrading.length}</p>
                </div>

            </section>


            <section className={styles.section}>

                <h3>My Courses</h3>

                {courseStats.length === 0 ? (
                    <p>You are not currently teaching any courses.</p>
                ) : (
                    <div className={styles.records}>

                        {courseStats.map(course => {

                            const awaitingGrading =
                                getAwaitingGrading(course.id);

                            return (
                                <div
                                    key={course.id}
                                    className={styles.record}
                                >

                                    <div>
                                        <h4>
                                            {course.subject_name}
                                            {course.code && ` (${course.code})`}
                                        </h4>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/app/courses/${course.id}/edit/`
                                                )
                                            }
                                        >
                                            Edit Course
                                        </button>
                                    </div>

                                    <p>
                                        Status:{" "}
                                        {course.is_active
                                            ? "Active"
                                            : "Inactive"
                                        }
                                    </p>

                                    <p>
                                        Total Students:{" "}
                                        {course.total_students}
                                    </p>

                                    <p>
                                        Active Students:{" "}
                                        {course.active_students}
                                    </p>

                                    <p>
                                        Completed Students:{" "}
                                        {course.completed_students}
                                    </p>

                                    <p>
                                        Dropped Students:{" "}
                                        {course.dropped_students}
                                    </p>

                                    <div>
                                        <p>
                                            Awaiting Grading:{" "}
                                            {awaitingGrading.length}
                                        </p>

                                        {awaitingGrading.length > 0 && (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        "/app/courses/progress/"
                                                    )
                                                }
                                            >
                                                Go to Gradebook
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );

                        })}

                    </div>
                )}

            </section>

        </div>
    );
}

export default TeacherDashboard;