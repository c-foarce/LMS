import { useState, useEffect } from "react"
import api from '../../services/api'

function NewUser() {

    // will store all the needed frields form the User Model
    const [fields, setFields] = useState([])

    // gets the rle of the user, possibly for denying access to Students/Teachers since this should be an admin only feature
    const [role, setRole] = useState("")

    const [success, setSuccess] = useState(false)

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

    const handleSubmit = (event) => {
        event.preventDefault();

        api.post("/accounts/create/", formData)
            .then(response => {

                setSuccess(true);

                setTimeout(() => {
                    setFormData({});
                    setSuccess(false)
                }, 3000)
            })
            .catch(error => {
                console.error(
                    "User creation failed:",
                    error.response?.data || error.message
                );
            });
    };

    useEffect(() => {
        api.get("/accounts/user-fields/")
            .then(response => {

                setFields(response.data.fields);

            })
            .catch(error => {
                if (error.response) {
                    console.error(error.response.data);
                } else {
                    console.error(error.message);
                }
            });

    }, [])

    return (
        <>
            <h1>New User Page</h1>
            {success && (
                <p>User sucessfully created!</p>
            )}

            <form onSubmit={handleSubmit}>
                {fields.map((field) => (

                    <div key={field.name}>

                        <label htmlFor={field.name}>
                            {field.name}
                        </label>

                        {field.choices ? (

                            <select
                                id={field.name}
                                name={field.name}
                                onChange={handleChange}
                                required={field.required}
                                defaultValue=""
                            >
                                <option value="" disabled>Select Role</option>

                                {field.choices.map(choice => (
                                    <option
                                        key={choice.value}
                                        value={choice.value}
                                    >
                                        {choice.label}
                                    </option>
                                ))}
                            </select>

                        ) : field.type === "TextField" ? (

                            <textarea
                                id={field.name}
                                name={field.name}
                                onChange={handleChange}
                            />

                        ) : (
                            // tyoe below here is set to "text" : "text" so that leaves option open for more hidden types later but keeps password visible
                            <input
                                id={field.name}
                                type={field.name === "password" ? "text" : "text"}
                                name={field.name}
                                required={field.required}
                                onChange={handleChange}
                            />

                        )}

                    </div>

                ))}

                <button type="submit">Submit</button>
            </form>
        </>
    )

}

export default NewUser