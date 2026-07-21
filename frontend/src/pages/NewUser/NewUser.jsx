import { useState, useEffect } from "react"
import api from '../../services/api'

function NewUser() {

    // will store all the needed frields form the User Model
    const [fields, setFields] = useState([])

    // gets the rle of the user, possibly for denying access to Students/Teachers since this should be an admin only feature
    const [role, setRole] = useState("")

    // Stores whatever the user has entered into the form.
    //
    // Example:
    // {
    //   first name: "John",
    //   last name: "Oliver"
    //   username: "John_Oliver", i think the username should initially be built from first+last name, but with the option of being changed in the front end before posting,
    //   role: "student",
    //   password: "testtest1212", this will be viewd as plain text on the front end, but hashed and stored in the database,
    //   description: "Introduction to physics"
    // }
    //
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
                console.log("User created", response.data);
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

                console.log("user fields acquired:");
                console.log(response.data);

                setFields(response.data.fields);

            })
            .catch(error => {
                console.log("could not access users model")
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

            <form onSubmit={handleSubmit}>
                {fields.map((field) => (

                    <div key={field.name}>

                        <label>{field.name}</label>

                        {field.choices ? (

                            <select
                                name={field.name}
                                onChange={handleChange}
                            >
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
                                name={field.name}
                                onChange={handleChange}
                            />

                        ) : (
                            // tyoe below here is set to "text" : "text" so that leaves option open for more hidden types later but keeps password visible
                            <input
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
            {/*Temporary debugging output. Shows what is in the package that will be sent to Django*/}

            <pre>
                {JSON.stringify(formData, null, 2)}
            </pre>

        </>
    )

}

export default NewUser