import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import styles from "./AdminDashboard.module.css";

function AdminDashboard() {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrolments, setEnrolments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                const [
                    usersResponse,
                    coursesResponse,
                    enrolmentsResponse
                ] = await Promise.all([
                    api.get("/accounts/all/"),
                    api.get("/courses/list/"),
                    api.get("/courses/enrolments/all/")
                ]);

                setUsers(usersResponse.data);
                setCourses(coursesResponse.data);
                setEnrolments(enrolmentsResponse.data);

            } catch (error) {

                setError("Failed to retrieve dashboard data.");

            } finally {

                setLoading(false);

            }

        };

        fetchDashboardData();

    }, []);


    // User data

    const studentCount = users.filter(
        user => user.role === "student"
    ).length;

    const teacherCount = users.filter(
        user => user.role === "teacher"
    ).length;

    const adminCount = users.filter(
        user => user.role === "admin"
    ).length;

    const totalUsers = users.length;


    // Course data

    const activeCourses = courses.filter(
        course => course.is_active
    ).length;

    const inactiveCourses = courses.filter(
        course => !course.is_active
    ).length;

    const totalCourses = courses.length;


    // Enrolment data

    const activeEnrolments = enrolments.filter(
        enrolment => enrolment.status === "active"
    ).length;

    const completedEnrolments = enrolments.filter(
        enrolment => enrolment.status === "completed"
    ).length;

    const totalEnrolments = enrolments.length;


    // Admin Action Data

    const coursesWithoutTeacher = courses.filter(
        course => !course.teacher_name
    );

    const usersWithMissingInfo = users.filter(
        user =>
            !user.first_name ||
            !user.last_name ||
            !user.email
    );

    const getMissingUserFields = (user) => {

        const missing = [];

        if (!user.first_name) missing.push("first name");
        if (!user.last_name) missing.push("last name");
        if (!user.email) missing.push("email");

        return missing;

    };


    //--------------------------------------------------------
    //---------------------RENDER RETURNS---------------------
    //--------------------------------------------------------

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }


    return (

        <div className={styles.page}>

            <h2>System Overview</h2>


            <section className={styles.section}>

                <div className={styles.sectionHeading}>
                    <h3>Users</h3>
                    <button onClick={() => navigate("/app/accounts/all/")}>
                        View Users
                    </button>
                </div>

                <div className={styles.overview}>

                    <div className={styles.summaryCard}>
                        <h4>Students</h4>
                        <p className={styles.summaryCount}>
                            {studentCount}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Teachers</h4>
                        <p className={styles.summaryCount}>
                            {teacherCount}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Admins</h4>
                        <p className={styles.summaryCount}>
                            {adminCount}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Total</h4>
                        <p className={styles.summaryCount}>
                            {totalUsers}
                        </p>
                    </div>

                </div>

            </section>


            <section className={styles.section}>

                <div className={styles.sectionHeading}>
                    <h3>Courses</h3>
                    <button onClick={() => navigate("/app/courses/all/")}>
                        View Courses
                    </button>
                </div>

                <div className={styles.overview}>

                    <div className={styles.summaryCard}>
                        <h4>Active Courses</h4>
                        <p className={styles.summaryCount}>
                            {activeCourses}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Inactive Courses</h4>
                        <p className={styles.summaryCount}>
                            {inactiveCourses}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Total</h4>
                        <p className={styles.summaryCount}>
                            {totalCourses}
                        </p>
                    </div>

                </div>

            </section>


            <section className={styles.section}>

                <div className={styles.sectionHeading}>
                    <h3>Enrolments</h3>
                    <button onClick={() => navigate("/app/courses/enrolments/all/")}>
                        View Enrolments
                    </button>
                </div>

                <div className={styles.overview}>

                    <div className={styles.summaryCard}>
                        <h4>Active Enrolments</h4>
                        <p className={styles.summaryCount}>
                            {activeEnrolments}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Completed Enrolments</h4>
                        <p className={styles.summaryCount}>
                            {completedEnrolments}
                        </p>
                    </div>

                    <div className={styles.summaryCard}>
                        <h4>Total</h4>
                        <p className={styles.summaryCount}>
                            {totalEnrolments}
                        </p>
                    </div>

                </div>

            </section>

            <section className={styles.section}>

                <h3>Administrative Attention</h3>

                {coursesWithoutTeacher.length === 0 &&
                    usersWithMissingInfo.length === 0 ? (

                    <p>No issues requiring attention.</p>

                ) : (

                    <>

                        {coursesWithoutTeacher.length > 0 && (

                            <div>

                                <h4>Courses without an assigned teacher</h4>

                                <div className={styles.records}>

                                    {coursesWithoutTeacher.map(course => (

                                        <div
                                            key={course.id}
                                            className={styles.record}
                                        >

                                            <div className={styles.attentionHeading}>

                                                <h4>
                                                    {course.subject_name}
                                                    {course.code &&
                                                        ` (${course.code})`
                                                    }
                                                </h4>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/app/courses/${course.id}/edit/`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                            </div>

                                            <p>Needs an assigned teacher.</p>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        )}


                        {usersWithMissingInfo.length > 0 && (

                            <div>

                                <h4>Users with missing information</h4>

                                <div className={styles.records}>

                                    {usersWithMissingInfo.map(user => (

                                        <div
                                            key={user.id}
                                            className={styles.record}
                                        >

                                            <div className={styles.attentionHeading}>

                                                <h4>{user.username}</h4>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/app/accounts/${user.id}/edit/`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                            </div>

                                            <p>Missing information:</p>

                                            <ul className={styles.missingFields}>
                                                {getMissingUserFields(user).map(field => (
                                                    <li key={field}>{field}</li>
                                                ))}
                                            </ul>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        )}

                    </>

                )}

            </section>


        </div>

    );

}

export default AdminDashboard;
