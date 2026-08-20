import { useState, useEffect } from "react";

import { useParams } from "react-router-dom"

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

function EditCourse() {

    //stores the id of the course being asked for by extracting it from the URL
    const { id } = useParams();
    const { user } = useAuth();

    //gets current course data
    const [formData, setFormData] = useState({})

    //stores available teachers for dropdowns
    const [teacherOptions, setTeacherOptions] = useState([])

    const [fields, setFields] = useState([])

    //used for feedback after successful patch
    const [success, setSuccess] = useState(false)

    //optional loading/error states
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    //get existing courses and teachers
    useEffect(() => {

        //get ID course info
        api.get(`/courses/${id}/`)
            .then(response => {
                setFormData(response.data);
            })
            .catch(error => {
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            })

        //get dynamic form info
        //includes teachers if admin
        api.get('/courses/course-fields')
            .then(response => {
                setFields(response.data.fields)
                setTeacherOptions(response.data.teacher_options);
            })
            .catch(error => {
                setError(error.message)
            })
            .finally(() => {
                setLoading(false)
            });


    }, [id])


    //handles change for each input
    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    //sends submitted data to django
    const handleSubmit = (event) => {

        event.preventDefault();

        api.patch(`/courses/${id}/edit/`, formData)
            .then(response => {

                setFormData(response.data)

                setSuccess(true);

                // if (user.role === "teacher") {
                //     setFormData({
                //         ...response.data,
                //         teacher: user.id
                //     });
                // } else {
                //     setFormData(response.data);
                // }

                setTimeout(() => {
                    setSuccess(false);
                }, 2000);

            })
            .catch(error => {
                setError(error.message)
            });
    };

    if (loading) {
        return <p>Loading...</p>
    }
    if (error) {
        return <p>{error}</p>
    }

    const renderField = (field) => {
        if (field.name === "teacher" && user.role === "admin") {
            return (
                <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                >
                    <option value="">
                        Select teacher:
                    </option>

                    {teacherOptions.map((teacher) => (
                        <option
                            key={teacher.id}
                            value={teacher.id}
                        >
                            {teacher.username}
                        </option>
                    ))}
                </select>
            );
        }


        if (field.widget === "textarea") {
            return (
                <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                />
            );
        }


        return (
            <input
                type={field.widget}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
            />
        );
    }


    return (
        <>
            <h1>Edit Course</h1>
            {success && (
                <p>
                    Course updated successfully!
                </p>
            )}

            <p>Editing Course: {id}</p>
            <form onSubmit={handleSubmit}>

                {fields.map((field) => {

                    // teachers cannot edit teacher assignment
                    // unless you decide they should later
                    if (
                        field.name === "teacher" &&
                        user.role === "teacher"
                    ) {
                        return null;
                    }

                    return (
                        <div key={field.name}>

                            <label>
                                {field.name}
                            </label>

                            {renderField(field)}

                        </div>
                    );

                })}


                <button type="submit">
                    Save changes
                </button>

            </form>
            <pre>
                {JSON.stringify(formData, null, 2)}
            </pre>
        </>
    )
}

export default EditCourse