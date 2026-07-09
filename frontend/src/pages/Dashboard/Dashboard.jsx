//important imports
import { useState, useEffect } from "react";
import api from '../../services/api'


function Dashboard() {

    // info will contain {"username", "role" of logged in user}
    const [info, setInfo] = useState(null);

    useEffect(() => {
        async function loadInfo() {
            // Sends GET request to /api/user-role/
            const res = await api.get("user-role/");

            // Saves the response data into React state
            setInfo(res.data);
        }

        loadInfo();

    }, []);
    //[] means once upon component render

    return (
        <div>
            <h1>Dashboard</h1>
            <h2>The below is for testing endpoint success</h2>

            <p>{info?.username}</p>
            <p>{info?.role}</p>
        </div>
    );
}

export default Dashboard