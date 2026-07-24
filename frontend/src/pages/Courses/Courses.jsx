import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

function Courses() {

  const navigate = useNavigate()

  const { user } = useAuth()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {

    const fetchCourses = async () => {

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

        setCourses(response.data)

      } catch (error) {

        console.error(error)

      } finally {

        setLoading(false)

      }

    };

    fetchCourses();
  }, [user]);


  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div>
        <h1>My Courses</h1>

        {courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          courses.map((course) => {

            if (user.role === "student") {

              return (
                <div key={course.id}>
                  <h3>{course.course_name}</h3>

                  <p>Code: {course.course_code}</p>

                  <p>Teacher: {course.teacher_name}</p>

                  <p>Status: {course.status}</p>

                  <p>Progress: {course.progress}%</p>

                  <p>Grade: {course.grade || "Not graded"}</p>
                </div>
              )

            } else {

              return (
                <div key={course.id}>
                  <h3>{course.subject_name}</h3>

                  <p>Code: {course.code}</p>

                  <p>Teacher: {course.teacher_name}</p>

                  <button
                  onClick={() =>  navigate(`/app/courses/${course.id}/edit`)}>
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