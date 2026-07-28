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

          case "admin":
            response = await api.get("/courses/list/")
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


  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div>
        <h1>My Courses</h1>

        {error && (
          <p>{error}</p>
        )}

        {items.length === 0 ? (
          <p>No courses found.</p>
        ) : (

          items.map((enrolment) => {

            if (user.role === "student") {

              return (

                <div key={enrolment.id}>
                  <h3>{enrolment.course_name}</h3>

                  <p>Code: {enrolment.course_code}</p>

                  <p>Teacher: {enrolment.teacher}</p>

                  <p>Status: {enrolment.status}</p>

                  <p>Progress: {enrolment.progress}%</p>

                  <button
                    onClick={() => handleSubmitProgress(enrolment.id)}
                  >Submit Progress</button>

                  <p>Grade: {enrolment.grade || "Not graded"}</p>
                  {/* Eventually combine this grade <p> with the below <button> in a conidtional: if not 100% of work submitted, no need to see grade */}
                </div>
              )

            } else {

              return (
                <div key={enrolment.id}>
                  <h3>{enrolment.subject_name}</h3>

                  <p>Code: {enrolment.code}</p>

                  <p>Teacher: {enrolment.teacher_name}</p>

                  <button
                    onClick={() => navigate(`/app/courses/${enrolment.id}/edit`)}>
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