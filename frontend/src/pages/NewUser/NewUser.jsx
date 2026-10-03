import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from '../../services/api'

function NewUser() {

    const navigate = useNavigate();

    // will store all the needed fields form the User Model
    const [fields, setFields] = useState([])

    // gets the role of the user, possibly for denying access to Students/Teachers since this should be an admin only feature
    const [role, setRole] = useState("")

    const [success, setSuccess] = useState(false)

    const [error, setError] = useState(null)

    // Stores whatever the user has entered into the form.
    // This object will eventually be sent as the POST request body.
    const [formData, setFormData] = useState({})


    // Runs every time an input changes.
    // Captures the field name and the user's value.
    const handleChange = (event) => {

        const { name, value } = event.target;

        // Updates formData.
        // The spread operator keeps all previous fields,
        // then replaces/adds the field that changed.
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        api.get("/accounts/user-fields/")
            .then(response => {

                setFields(response.data.fields);

            })
            .catch(() => {
                setError("Failed to load user fields.");
            });

    }, [])

    const handleSubmit = (event) => {
        event.preventDefault();

        api.post("/accounts/create/", formData)
            .then(() => {

                setSuccess(true);

                setTimeout(() => {
                    setFormData({});
                    setSuccess(false)
                }, 3000)
            })
            .catch(() => {
                setError(
                    error.response?.data?.detail ||
                    error.response?.data?.non_field_errors?.[0] ||
                    "Failed to create user."
                );
            });
    };


    const fieldLabels = {
        username: "Username",
        first_name: "First Name",
        last_name: "Last Name",
        email: "Email",
        password: "Password",
        role: "Role",
    };

    const renderField = (field) => {

        if (field.choices) {
            return (
                <select
                    id={field.name}
                    name={field.name}
                    onChange={handleChange}
                    value={formData[field.name] || ""}
                    required={field.required}
                >
                    <option value="">
                        Select role:
                    </option>

                    {field.choices.map((choice) => (
                        <option
                            key={choice.value}
                            value={choice.value}
                        >
                            {choice.label}
                        </option>
                    ))}
                </select>
            );
        }


        if (field.type === "TextField") {
            return (
                <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                />
            );
        }


        return (
            <input
                id={field.name}
                type={field.name === "password" ? "text" : "text"}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ""}
                onChange={handleChange}
            />
        );

    };



    return (
        <>

            <div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
            </div>
            <h1>New User Page</h1>

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleSubmit}>
                {fields.map((field) => {

                    return (
                        <div key={field.name}>

                            <label htmlFor={field.name}>
                                {fieldLabels[field.name] || field.name}:
                            </label>

                            {renderField(field)}

                        </div>
                    );

                })}

                <div>
                    <div>
                        <button type="submit">
                            Create User
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                    </div>

                    {success && (
                        <span>User successfully created!</span>
                    )}
                </div>
            </form>
        </>
    )

}

export default NewUser