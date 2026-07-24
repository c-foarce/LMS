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

                <label>
                    Subject Name:
                    <input
                        type="text"
                        name="subject_name"
                        value={formData.subject_name || ""}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Code:
                    <input
                        type="text"
                        name="code"
                        value={formData.code || ""}
                        onChange={handleChange}
                    />
                </label>


                <label>
                    Description:
                    <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                    />
                </label>


                {teacherOptions.length > 0 && (
                    <label>
                        Teacher:

                        <select
                            name="teacher"
                            value={formData.teacher || ""}
                            onChange={handleChange}
                        >

                            {teacherOptions.map(teacher => (
                                <option
                                    key={teacher.id}
                                    value={teacher.id}
                                >
                                    {teacher.username}
                                </option>
                            ))}

                        </select>

                    </label>
                )}
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