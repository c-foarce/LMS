import { useState, useEffect } from "react"
import api from '../../services/api'


function NewCourse() {

  //SETTING STATE

  // Stores the list of fields received from Django. taken from course model
  const [fields, setFields] = useState([])

  // Stores the logged-in user's role. Used currently to determine the method of displaying teachers, pre-set or dropdown
  // possibly a good use case to store it so if students come to this page via entering the URL, they are locked out. simple check at the top, render "ACCESS DENIED" if true
  const [role, setRole] = useState("")

  // for tracking when a successful POST has been made, flags to reset the page back to default
  const [success, setSuccess] = useState(false);

  // captures TeacherID, for use in case of teacher created courses
  const [teacherId, setTeacherId] = useState(null)

  // Stores all possible teachers, only for use when role == "admin"
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
  //   subject_name: "Physics",
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
    event.preventDefault();

    api.post("/courses/create/", formData)
      .then(response => {
        console.log("Course Created", response.data);

        setSuccess(true);

        // this will reset the form
        setTimeout(() => {
          if (role === "teacher") {
            setFormData({
              teacher: teacherId, 
            });
          } else {
            setFormData({})
          }

          //hide success message
          setSuccess(false)


        }, 3000)
      })
      .catch(error => {
        console.error("Course creation failed:", error.response.data);
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

        // saves all fields form course model in array
        setFields(response.data.fields);

        // store the current logged in users role
        setRole(response.data.role);

        // store current users id
        setTeacherId(response.data.teacher_id)

        if (response.data.role === "teacher") {
          setFormData({
            teacher: response.data.teacher_id,
          });
        }

        // gets all users with role == "teacher" to be used with admin view
        setTeacherOptions(response.data.teacher_options)
      })
      .catch(error => {

        // for debugging, logs error to console
        console.error(error)
        //IF NO INTERNET DISPLAY BAD PAGE

      });

  }, []);


  return (
    <>
      {success && (
        <p>Course sucessfully created!</p>
      )}
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
                  value={formData[field.name] || ""}
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
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                />


              ) : (

                // Normal model fields become normal inputs.
                // "required" comes from Django's blank=False setting.
                <input
                  type="text"
                  name={field.name}
                  required={field.required}
                  value={formData[field.name] || ""}
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