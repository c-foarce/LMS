//important imports
import { useState, useEffect } from "react";
import api from '../../services/api'

import { useAuth } from "../../context/AuthContext";


function Dashboard() {

    const { user, loading } = useAuth()

    // info will contain {"username", "role" of logged in user}
    const [info, setInfo] = useState(null);

    //[] means once upon component render

    return (
        <div>
            <h1>Dashboard {user?.role} view - Welcome, {user?.username}!</h1>
            <h2>The below is for testing endpoint success</h2>

            <p>{user?.username}</p>
            <p>{user?.role}</p>
        </div>
    );
}

export default Dashboard