import RenderCard from "./RenderCard";

function UserCard({ user }) {

    const details = [
        { label: "Name", value: `${user.first_name} ${user.last_name}` },
        { label: "Email", value: user.email || "No email provided" },
        { label: "Role", value: user.role }
    ]

    return (
        <RenderCard
            title={`User: ${user.id} | ${user.username}`}
            details={details}
        />
    )
}

export default UserCard