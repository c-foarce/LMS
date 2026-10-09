import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext'

import api from '../../services/api'

import styles from "./Courses.module.css"

import StudentCourseCard from "../../components/CourseCards/StudentCourseCard";
import TeacherCourseCard from "../../components/CourseCards/TeacherCourseCard";
import SearchAndFilter from "../../components/Filters/SearchAndFilter";

function Courses() {

  const navigate = useNavigate()

  const { user } = useAuth()

  const [items, setItems] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
            setError("Unknown user role.")
            return;

        }


        setItems(response.data)


      } catch (error) {

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

      setError(
        error.response?.data?.detail ||
        "Something went wrong when trying to process the request"
      )

      setTimeout(() => {
        setError(null)
      }, 3000)

    }
  }

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();

    if (user.role === "student") {
      const matchesSearch =
        item.course_name.toLowerCase().includes(search) ||
        item.course_code.toLowerCase().includes(search) ||
        item.teacher.toLowerCase().includes(search);

      const matchesStatus =
        !statusFilter ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    }

    if (user.role === "teacher") {
      const matchesSearch =
        item.subject_name.toLowerCase().includes(search) ||
        (item.code || "").toLowerCase().includes(search);

      const matchesStatus =
        !statusFilter ||
        (item.is_active ? "Active" : "Inactive") === statusFilter;

      return matchesSearch && matchesStatus;
    }

    return false;
  });

  //--------------------------------------------------------
  //---------------------RENDER RETURNS---------------------
  //--------------------------------------------------------


  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div className={styles.page}>
        <h1>My Courses</h1>

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {success && (
          <p className={styles.success}>{success}</p>
        )}

        <SearchAndFilter
          search={searchTerm}
          onSearchChange={setSearchTerm}
          searchLabel="Search:"
          searchPlaceholder="Search courses..."
          filters={[
            {
              id: "status-filter",
              label: "Status:",
              column: "right",
              value: statusFilter,
              onChange: setStatusFilter,
              defaultLabel: "All Statuses",
              options:
                user.role === "student"
                  ? ["active", "completed"]
                  : ["Active", "Inactive"],
              getValue: status => status,
              getLabel: status =>
                status.charAt(0) + status.slice(1).toLowerCase(),
            },
          ]}
          onClear={() => {
            setSearchTerm("");
            setStatusFilter("");
          }}
        />

        {filteredItems.length === 0 ? (
          <p>
            {items.length === 0
              ? "No courses found."
              : "No courses match your filters."
            }
          </p>
        ) : (

          <div className={styles.grid}>
            {filteredItems.map((item) => {
              if (user.role === "student") {
                return (
                  <StudentCourseCard
                    key={item.id}
                    course={item}
                    onSubmitProgress={handleSubmitProgress}
                  />
                );
              }

              if (user.role === "teacher") {
                return (
                  <TeacherCourseCard
                    key={item.id}
                    course={item}
                    onToggleActive={handleToggleActive}
                    onEdit={() =>
                      navigate(`/app/courses/${item.id}/edit`)
                    }
                  />
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

    </>
  );
}

export default Courses