import { useState, useEffect } from "react"
import api from '../../services/api'


function NewCourse() {

  // Stores the list of fields received from Django.
  // This is generated from the Course model, so React does not need
  // to know the Course fields ahead of time.
  const [fields, setFields] = useState([])

  // Stores the logged-in user's role.
  // Used to decide whether to hide the teacher field or show the dropdown.
  const [role, setRole] = useState("")

  // Stores all possible teachers.
  // This is only populated for admins.
  // Each item contains information like:
  // {
  //   id: 3,
  //   username: "teacher1"
  // }
  const [teacherOptions, setTeacherOptions] = useState([])


  // Stores whatever the user has entered into the form.
  //
  // Example:
  // {
  //   name: "Physics",
  //   code: "PHY101",
  //   teacher: "3",
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
    event.preventDefault()

    api.post("/courses/create/", formData)
      .then(response => {
        console.log("Course Created", response.data);
      })
      .catch(error => {
        console.error("Course creation failed:", error.response.data)
      })
  }


  // Runs once when this component first loads.
  //
  // Gets:
  // - the user's role
  // - the fields needed to build the form
  // - possible teachers if the user is an admin
  useEffect(() => {

    api.get("/courses/course-fields/")
      .then(response => {

        console.log(response.data);

        // Save the fields Django generated from the Course model
        setFields(response.data.fields);

        // Save current user's role
        setRole(response.data.role);

        // Save possible teacher choices for admin dropdown
        setTeacherOptions(response.data.teacher_options)
      })
      .catch(error => {

        // Logs API errors while developing
        console.error(error)

      });

  }, []);


  return (
    <>
      <h1>New Course Page</h1>

      <form onSubmit={handleSubmit}>
        {fields.map((field) => {

          {/* Teachers should not choose a teacher. Their own user account will eventually be assigned by the backend. */ }
          if (field.name === "teacher" && role === "teacher") {
            return null;
          }


          return (
            <div key={field.name}>

              <label>{field.name}</label>


              {/*If the current user is an admin:
             show a dropdown instead of a normal text input.
             The dropdown sends the teacher ID as the value.*/}
              {field.name === "teacher" && role === "admin" ? (

                <select
                  name="teacher"
                  onChange={handleChange}
                  required={field.required}
                >

                  {teacherOptions.map((teacher) => (

                    <option
                      key={teacher.id}
                      value={teacher.id}
                    >
                      {teacher.username}
                    </option>

                  ))}

                </select>


              ) : field.type === "TextField" ? (

                // TextField from Django becomes a textarea.
                <textarea
                  name={field.name}
                  onChange={handleChange}
                />


              ) : (

                // Normal model fields become normal inputs.
                // "required" comes from Django's blank=False setting.
                <input
                  type="text"
                  name={field.name}
                  required={field.required}
                  onChange={handleChange}
                />

              )}

            </div>
          );

        })}


        <button type="submit" >Submit</button>
      </form>
      {/*Temporary debugging output. Shows what is in the package that will be sent to Django*/}

      <pre>
        {JSON.stringify(formData, null, 2)}
      </pre>

    </>
  )

}

export default NewCourse