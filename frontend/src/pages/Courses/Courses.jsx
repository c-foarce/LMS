import { useEffect, useState } from "react";
import api from '../../services/api'

function Courses() {
  const [enrolments, setEnrolments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEnrolments = async () => {
      try {
        const response = await api.get("/courses/enrolments/me/")
        setEnrolments(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    };

    fetchEnrolments();
  }, []);

  useEffect(() => {
  }, [enrolments])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div>
        <h1>My Courses</h1>

        {enrolments.length === 0 ? (
          <p>You aren't enrolled in any courses.</p>
        ) : (
          enrolments.map((enrolment) => {
            return (
            <div key={enrolment.id}>
              <h3>{enrolment.course_name}</h3>

              <p>Code: {enrolment.course_code}</p>

              <p>Teacher: {enrolment.teacher}</p>

              <p>Status: {enrolment.status}</p>

              <p>Progress: {enrolment.progress}%</p>

              <p>Grade: {enrolment.grade || "Not graded"}</p>
            </div>
            )
          })
        )}
      </div>

    </>
  );
}

export default Courses