import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

import UserCard from "../../components/DisplayCards/UserCard";

function UserList() {

    const { user } = useAuth() //needed? not sure, good failsafe maybe?

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    //This block is repeated on all major "get all of this model type" pages. extraction candidate?
    useEffect(() => {
        const fetchUsers = async () => {

            try {
                const response = await api.get("/accounts/all/");

                console.log("ALL USERS", response.data);

                setUsers(response.data)
            } catch (error) {

                console.error(error);
                setError("Failed to retreive User data.")
            } finally {
                setLoading(false)
            }
        };

        fetchUsers()
    }, [])


    const handleDelete = async (userId) => {

        console.log("DEL USER ID:", userId)

        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        )

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(`/accounts/${userId}/delete/`)

            setUsers(previousUsers =>
                previousUsers.filter(
                    user => user.id !== userId
                )
            )

        } catch (error) {

            console.error(error)
            setError("Could not delete user.")

        }
    }



    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <>
            <h1>User List</h1>

            {error && (
                <p>{error}</p>
            )}

            {users.length === 0 ? (
                <p>Connection successful, no users found.</p>
            ) : (
                users.map(user => (
                    <UserCard
                        key={user.id}
                        user={user}
                        role={user.role}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </>
    )
}

export default UserList