import RenderCard from "./RenderCard";

function UserCard({ user, role, onDelete }) {

    const details = [
        {
            label: "Name",
            value: `${user.first_name} ${user.last_name}`
        },
        {
            label: "Email",
            value: user.email || "No email provided"
        },
        {
            label: "Role",
            value: user.role
        }
    ]

    const actions = []

    if (role === "admin") {
        actions.push(
            <button
                key="delete"
                onClick={() => onDelete(user.id)}
            >
                Delete User
            </button>
        )
    }

    return (
        <RenderCard
            title={`User: ${user.id} | ${user.username}`}
            details={details}
            actions={actions}
        />
    )
}

export default UserCard