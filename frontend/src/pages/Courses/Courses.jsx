import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

function Courses() {

  const navigate = useNavigate()

  const { user } = useAuth()

  const [items, setItems] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  //on initial mounting, get the enrolment data to render
  useEffect(() => {

    const fetchItems = async () => {

      try {

        let response;

        switch (user.role) {

          case "student":
            response = await api.get("/courses/enrolments/me/");
            break;

          case "teacher":
            response = await api.get("/courses/teaching/")
            break;

          case "admin": //this should probably be a redirect to /courses/all, not sure on implementing a navigatge in switch case tho
            response = await api.get("/courses/list/")
            console.log(response.data)
            break;

          default:
            console.error("Unknown user role.")
            return;

        }

        // const response = await api.get("/courses/enrolments/me/")

        setItems(response.data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    };

    fetchItems();
  }, [user]);


  const handleSubmitProgress = async (enrolmentId) => {

    const confirmed = window.confirm(
      "Submit progress for this course?"
    )

    if (!confirmed) {
      return
    }


    try {

      setError(null)

      const response = await api.post(
        `/courses/enrolments/${enrolmentId}/submit/`
      )

      console.log("SUBMIT RESPONSE:", response)

      setItems(previousItems =>
        previousItems.map(enrolment =>
          enrolment.id === response.data.id
            ? response.data
            : enrolment
        )
      )

      setSuccess("Progress submitted successfully")

      setTimeout(() => {
        setSuccess(null)
      }, 2000);

    } catch (error) {

      console.error("SUBMIT ERROR:", error)

      setError(
        error.response?.data?.detail ||
        "Something went wrong when submitting"
      )

      setTimeout(() => {
        setError(null)

      }, 3000);

    }
  }

  const handleAcknowledeCompletion = async (enrolmentId) => {

    try {

      setError(null)

      const response = await api.patch(
        `/courses/enrolments/${enrolmentId}/acknowledge/`
      )

      console.log("COMPLETION ACKNOWLEDGED:", response.data)

      setItems(previousItems =>
        previousItems.map(enrolment =>
          enrolment.id === enrolmentId
            ? {
              ...enrolment,
              student_completed: true
            }
            : enrolment
        )
      )

    } catch (error) {

      console.error(
        "Completion acknowledgement failed:",
        error
      )

      setError(
        error.response?.data?.detail ||
        "Something went wrong when acknowledging completion."
      )
    }

  }

  const handleToggleActive = async (courseId) => {

    try {

      setError(null)

      const response = await api.patch(
        `/courses/${courseId}/toggle-active/`
      )

      setItems(previousItems =>
        previousItems.map(course =>
          course.id === response.data.id
            ? response.data
            : course
        )
      )

    } catch (error) {

      console.error("SUBMIT ERROR:", error)

      setError(
        error.response?.data?.detail ||
        "Something went wrong when trying to process the request"
      )

      setTimeout(() => {
        setError(null)

      }, 3000);

    }


  }


  if (loading) {
    return <p>Loading...</p>
  }

  {/* Later, extract this whole chunk into a couple of component Cards, similar to KingdomCards from MoonTracker */ }
  return (
    <>
      <div>
        <h1>My Courses</h1>

        {error && (
          <p>{error}</p>
        )}

        {success && (
          <p>{success}</p>
        )}
        {/* The above will have to be sent down to the component that gets made */}

        {items.length === 0 ? (
          <p>No courses found.</p>
        ) : (

          items.map((item) => {

            if (user.role === "student") {

              return (

                <div key={item.id}>
                  <h3>{item.course_name}</h3>

                  <p>Code: {item.course_code}</p>

                  <p>Teacher: {item.teacher}</p>

                  <p>Status: {item.status}</p>

                  <p>Progress: {item.progress}%</p>

                  {item.progress === 100 ? (
                    <>
                      <p>
                        Grade: {item.grade || "Awaiting grade"}
                      </p>

                      {item.grade && !item.student_completed && (
                        <button
                          onClick={() =>
                            handleAcknowledeCompletion(item.id)
                          }
                        >
                          Confirm Course Completion
                        </button>
                      )}

                      {item.student_completed && (
                        <p>
                          Course completion acknowledged.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSubmitProgress(item.id)}
                      >
                        Submit Progress
                      </button>

                      <p>
                        Grade: {item.grade || "Not graded"}
                      </p>
                    </>
                  )}

                </div>
              )

            } else {

              {/* Having this work for admin kind of doesnt make sense, there's the EnrolmentList page now. maybe move all admin related work there ie delete, deactivate etc */ }
              return (
                <div key={item.id}>
                  <h3>{item.subject_name}</h3>

                  <p>Code: {item.code}</p>

                  <p>Teacher: {item.teacher_name}</p>

                  <p>Status: {item.is_active ? "Active" : "Inactive"}</p>

                  {user.role === "admin" && (
                    <button>Delete Course</button>
                  )}

                  <button
                    onClick={() => handleToggleActive(item.id)}
                  >
                    {item.is_active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => navigate(`/app/courses/${item.id}/edit`)}
                  >
                    Edit
                  </button>
                </div>
              )

            }

          })
        )}
      </div>

    </>
  );
}

export default Courses