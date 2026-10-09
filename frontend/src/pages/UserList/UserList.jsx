import { useEffect, useState } from "react";

import api from '../../services/api';

import styles from "./UserList.module.css";

import SearchAndFilter from "../../components/Filters/SearchAndFilter";

import UserCard from "../../components/UserCards/UserCard";

function UserList() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("")


    //This block is repeated on all major "get all of this model type" pages. extraction candidate?
    useEffect(() => {
        const fetchUsers = async () => {

            try {
                const response = await api.get("/accounts/all/");

                setUsers(response.data)
            } catch (error) {

                setError("Failed to retreive User data.")
            } finally {
                setLoading(false)
            }
        };

        fetchUsers()
    }, [])


    //This only goes by usernames, might want to add firstname/lastname filtering later
    const filteredUsers = users.filter(user => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            user.username?.toLowerCase().includes(search) ||
            user.first_name?.toLowerCase().includes(search) ||
            user.last_name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search);

        const matchesRole =
            !roleFilter ||
            user.role === roleFilter;

        return matchesSearch && matchesRole;
    });


    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div className={styles.page}>
            <h1>User List</h1>

            {error && (
                <p>{error}</p>
            )}
            
            <SearchAndFilter
                search={searchTerm}
                onSearchChange={setSearchTerm}
                searchLabel="Search:"
                searchPlaceholder="Search users..."
                filters={[
                    {
                        id: "role-filter",
                        label: "Role:",
                        column: "right",
                        value: roleFilter,
                        onChange: setRoleFilter,
                        defaultLabel: "All Roles",
                        options: [
                            { value: "student", label: "Student" },
                            { value: "teacher", label: "Teacher" },
                            { value: "admin", label: "Admin" },
                        ],
                        getValue: role => role.value,
                        getLabel: role => role.label,
                    },
                ]}
                onClear={() => {
                    setSearchTerm("");
                    setRoleFilter("");
                }}
            />

            {users.length === 0 ? (
                <p>Connection successful, no users found.</p>
            ) : filteredUsers.length === 0 ? (
                <p>No users match your search or filter.</p>
            ) : (
                <div className={styles.grid}>
                    {filteredUsers.map(user => (
                        <UserCard
                            key={user.id}
                            user={user}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserList