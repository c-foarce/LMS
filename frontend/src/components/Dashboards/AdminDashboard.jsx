import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

function AdminDashboard() {

    const navigate = useNavigate()

    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([])
    const [enrolments, setEnrolments] = useState([])

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                const [usersResponse, coursesResponse, enrolmentsResponse] =
                    await Promise.all([
                        api.get("/accounts/all/"),
                        api.get("/courses/list/"),
                        api.get("/courses/enrolments/all/")
                    ]);

                setUsers(usersResponse.data);
                setCourses(coursesResponse.data);
                setEnrolments(enrolmentsResponse.data);

            } catch (error) {

                console.error("Failed to retrieve dashboard data:", error);
                setError("Failed to retrieve dashboard data.");

            } finally {

                setLoading(false);

            }
        };

        fetchDashboardData();

    }, []);

    //User data

    const studentCount = users.filter(
        user => user.role === "student"
    ).length;

    const teacherCount = users.filter(
        user => user.role === "teacher"
    ).length;

    const adminCount = users.filter(
        user => user.role === "admin"
    ).length;

    const totalUsers = users.length


    //Course data

    const activeCourses = courses.filter(
        course => course.is_active
    ).length;

    const inactiveCourses = courses.filter(
        course => !course.is_active
    ).length;

    const totalCourses = courses.length;


    //Enrolment Data

    const activeEnrolments = enrolments.filter(
        enrolment => enrolment.status === "active"
    ).length;

    const completedEnrolments = enrolments.filter(
        enrolment => enrolment.status === "completed"
    ).length;

    //ununsed atm, commenting out until implemented
    // const droppedEnrolments = enrolments.filter(
    //     enrolment => enrolment.status === "dropped"
    // ).length;

    const totalEnrolments = enrolments.length;


    //Admin Action Data

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
        <div>

            <h2>System Overview</h2>

            <div>

                <h3>Users</h3>

                <p>Students: {studentCount}</p>
                <p>Teachers: {teacherCount}</p>
                <p>Admins: {adminCount}</p>
                <p>Total: {totalUsers}</p>

            </div>

            <div>

                <h3>Courses</h3>

                <p>Active Courses: {activeCourses}</p>
                <p>Inactive Courses: {inactiveCourses}</p>
                <p>Total Courses: {totalCourses}</p>

            </div>

            <div>

                <h3>Enrolments</h3>

                <p>Active Enrolments: {activeEnrolments}</p>
                <p>Completed Enrolments: {completedEnrolments}</p>
                {/* <p>Dropped Enrolments: {droppedEnrolments}</p> */}
                <p>Total Enrolments: {totalEnrolments}</p>

            </div>

            <div>
                <h3>Administrative Attention</h3>

                {coursesWithoutTeacher.length === 0 &&
                    usersWithMissingInfo.length === 0 ? (
                    <p>No issues requiring attention.</p>
                ) : (
                    <>
                        {coursesWithoutTeacher.length > 0 && (
                            <div>
                                <h4>Courses without an assigned teacher</h4>

                                <ul>
                                    {coursesWithoutTeacher.map(course => (
                                        <li key={course.id}>
                                            <span>
                                                {course.subject_name}
                                                {course.code && ` (${course.code})`}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/app/courses/${course.id}/edit/`
                                                    )
                                                }
                                            >
                                                Edit Course
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {usersWithMissingInfo.length > 0 && (
                            <div>
                                <h4>Users with missing information</h4>

                                <ul>
                                    {usersWithMissingInfo.map(user => (
                                        <li key={user.id}>
                                            <span>
                                                {user.username} — Missing:{" "}
                                                {getMissingUserFields(user).join(", ")}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/app/accounts/${user.id}/edit/`
                                                    )
                                                }
                                            >
                                                Edit User
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
}

export default AdminDashboard