import RenderCard from "./RenderCard";

function UserCard({ user, onDelete }) {

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

    const actions = (
        <button onClick={() => onDelete(user.id)}>
            Delete User
        </button>
    )

    return (
        <RenderCard
            title={`User: ${user.id} | ${user.username}`}
            details={details}
            actions={actions}
        />
    )
}

export default UserCard