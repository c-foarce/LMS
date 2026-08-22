import { useNavigate } from "react-router-dom";

import RenderCard from "./RenderCard";

function UserCard({ user }) {

    const navigate = useNavigate();

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
    ];

    const actions = [
        <button
            key="edit"
            onClick={() => navigate(`/app/accounts/${user.id}/edit/`)}
        >
            Edit User
        </button>
    ];

    return (
        <RenderCard
            title={`User: ${user.id} | ${user.username}`}
            details={details}
            actions={actions}
        />
    );
}

export default UserCard;