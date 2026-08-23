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
            response = await api.get("/courses/teaching/dashboard/")
            break;

          default:
            console.error("Unknown user role.")
            return;

        }


        setItems(response.data)
        console.log(response.data)

      } catch (error) {

        console.error("Failed to retrieve courses:", error);

        setError(
          error.response?.data?.detail ||
          "Failed to retrieve courses."
        );

      } finally {
        setLoading(false);
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


  const handleToggleActive = async (courseId) => {

    try {

      setError(null)

      const response = await api.patch(
        `/courses/${courseId}/toggle-active/`
      )

      setItems(previousItems =>
        previousItems.map(course =>
          course.id === courseId
            ? {
              ...course,
              is_active: response.data.is_active
            }
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
      }, 3000)

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
                    <p>
                      Grade: {item.grade || "Awaiting grade"}
                    </p>
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

            }

            if (user.role === "teacher") {

              return (

                <div key={item.id}>

                  <h3>
                    {item.subject_name}
                    {item.code && ` (${item.code})`}
                  </h3>

                  <p>
                    Status: {item.is_active ? "Active" : "Inactive"}
                  </p>

                  <p>
                    Total Students: {item.total_students}
                  </p>

                  <p>
                    Active Students: {item.active_students}
                  </p>

                  <p>
                    Completed Students: {item.completed_students}
                  </p>

                  <p>
                    Dropped Students: {item.dropped_students}
                  </p>

                  <div>
                    <button
                      onClick={() => handleToggleActive(item.id)}
                    >
                      {item.is_active ? "Deactivate Course" : "Activate Course"}
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/app/courses/${item.id}/edit`)
                      }
                    >
                      Edit Course
                    </button>
                  </div>

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