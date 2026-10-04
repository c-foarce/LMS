import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import api from '../../services/api'


function NewCourse() {

  const navigate = useNavigate()

  // Stores the list of fields received from Django. taken from course model
  const [fields, setFields] = useState([])

  // Stores the logged-in user's role. Used currently to determine the method of displaying teachers, pre-set or dropdown
  // possibly a good use case to store it so if students come to this page via entering the URL, they are locked out. simple check at the top, render "ACCESS DENIED" if true
  const [role, setRole] = useState("")

  // for tracking when a successful POST has been made, flags to reset the page back to default
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState(null)

  // Stores all possible teachers, only for use when role == "admin"
  const [teacherOptions, setTeacherOptions] = useState([])


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
    setError(null);

    api.post("/courses/create/", formData)
      .then(() => {

        setSuccess(true);

        // this will reset the form
        setTimeout(() => {
          setFormData({});

          //hide success message
          setSuccess(false)


        }, 3000)
      })
      .catch(() => {
        setError("Failed to create course.");
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

        // saves all fields form course model in array
        setFields(response.data.fields);

        // store the current logged in users role
        setRole(response.data.role);
        setTeacherOptions(response.data.teacher_options || []);
      })
      .catch(() => {

        setError("Failed to load course fields.");

      });

  }, []);

  const fieldLabels = {
    subject_name: "Subject Name",
    code: "Course Code",
    description: "Description",
    teacher: "Teacher",
    total_submissions: "Required Submissions",
  };

  const renderField = (field) => {

    if (field.name === "teacher" && role === "admin") {
      return (
        <select
          id={field.name}
          name={field.name}
          onChange={handleChange}
          value={formData[field.name] || ""}
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
          id={field.name}
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleChange}
        />
      );
    }


    return (
      <input
        id={field.name}
        type={field.widget}
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

      <h1>New Course Page</h1>

      {error && (
        <p>{error}</p>
      )}

      {success && (
        <p>Course successfully created!</p>
      )}

      <form onSubmit={handleSubmit}>

        {fields.map((field) => {

          {/* Teachers should not choose a teacher. Their own user account will eventually be assigned by the backend. */ }
          if (field.name === "teacher" && role === "teacher") {
            return null;
          }


          return (
            <div key={field.name}>

              <label htmlFor={field.name}>
                {fieldLabels[field.name] || field.name}:
              </label>

              {/*If the current user is an admin:
             show a dropdown instead of a normal text input.
             The dropdown sends the teacher ID as the value.*/}
              {renderField(field)}


            </div>
          );

        })}


        <div>
          <button type="submit">
            Create Course
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
        
      </form>
    </>
  )

}

export default NewCourse