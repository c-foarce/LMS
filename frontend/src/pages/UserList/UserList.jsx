import { useEffect, useState } from "react";

import api from '../../services/api'

import UserCard from "../../components/DisplayCards/UserCard";

function UserList() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [searchTerm, setSearchTerm] = useState("")


    //This block is repeated on all major "get all of this model type" pages. extraction candidate?
    useEffect(() => {
        const fetchUsers = async () => {

            try {
                const response = await api.get("/accounts/all/");

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
    

    //This only goes by usernames, might want to add firstname/lastname filtering later
    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <>
            <h1>User List</h1>

            {error && (
                <p>{error}</p>
            )}

            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
            />



            {users.length === 0 ? (
                <p>Connection successful, no users found.</p>
            ) : (
                filteredUsers.map(user => (
                    <UserCard
                        key={user.id}
                        user={user}

                    />
                ))
            )}
        </>
    )
}

export default UserList