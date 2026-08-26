import StudentDashboard from "../../components/Dashboards/StudentDashboard";
import TeacherDashboard from "../../components/Dashboards/TeacherDashboard";
import AdminDashboard from "../../components/Dashboards/AdminDashboard";

import { useAuth } from "../../context/AuthContext";

function Dashboard() {

    const { user } = useAuth();

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <h1>{user.username}'s Dashboard</h1>

            {user.role === "student" && (
                <StudentDashboard />
            )}

            {user.role === "teacher" && (
                <TeacherDashboard />
            )}

            {user.role === "admin" && (
                <AdminDashboard />
            )}
        </>
    );
}

export default Dashboard