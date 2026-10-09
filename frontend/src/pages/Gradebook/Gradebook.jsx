import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import styles from "./Gradebook.module.css";

import SearchAndFilter from "../../components/Filters/SearchAndFilter";

import StudentGradeCard from "../../components/GradeCards/StudentGradeCard";

function Gradebook() {

    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedGrades, setSelectedGrades] = useState({});
    const [editingGrades, setEditingGrades] = useState({});

    const [selectedCourse, setSelectedCourse] = useState("all");
    const [selectedGradeStatus, setSelectedGradeStatus] = useState("all");


    useEffect(() => {

        const fetchProgress = async () => {

            try {

                const response = await api.get(
                    "/courses/teaching/progress/"
                );

                setCourses(response.data);

            } catch (error) {

                setError(
                    "Failed to retrieve student progress."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchProgress();

    }, []);


    const handleSaveGrade = async (enrolmentId) => {

        try {

            await api.patch(
                `/courses/enrolments/${enrolmentId}/grade/`,
                {
                    grade: selectedGrades[enrolmentId]
                }
            );

            setCourses(previousCourses =>
                previousCourses.map(course => ({
                    ...course,
                    completed_students:
                        course.completed_students.map(student =>
                            student.id === enrolmentId
                                ? {
                                    ...student,
                                    grade: selectedGrades[enrolmentId]
                                }
                                : student
                        )
                }))
            );

            setSelectedGrades(previousGrades => {
                const updatedGrades = { ...previousGrades };

                delete updatedGrades[enrolmentId];

                return updatedGrades;
            });

            setEditingGrades(previousEditing => {
                const updatedEditing = { ...previousEditing };

                delete updatedEditing[enrolmentId];

                return updatedEditing;
            });

        } catch (error) {

            setError("Failed to save grade.");

        }
    };


    // Stores the grade currently selected
    // for each enrolment.

    const handleGradeChange = (enrolmentId, grade) => {

        setSelectedGrades(previousGrades => ({
            ...previousGrades,
            [enrolmentId]: grade
        }));

    };


    const handleEditGrade = (enrolmentId) => {

        setEditingGrades(previousEditing => ({
            ...previousEditing,
            [enrolmentId]: true
        }));

        setSelectedGrades(previousGrades => ({
            ...previousGrades,
            [enrolmentId]: ""
        }));
    };


    const handleCancelGradeEdit = (enrolmentId) => {

        setEditingGrades(previousEditing => {
            const updatedEditing = { ...previousEditing };

            delete updatedEditing[enrolmentId];

            return updatedEditing;
        });

        setSelectedGrades(previousGrades => {
            const updatedGrades = { ...previousGrades };

            delete updatedGrades[enrolmentId];

            return updatedGrades;
        });
    };


    const courseOptions = courses;


    /*
     * Filter the courses based on the selected course.
     *
     * Then filter the completed students inside each course
     * based on their grade status.
     *
     * Importantly, the course itself is NOT removed when it
     * has no students matching the grade filter.
     */

    const filteredCourses = courses
        .filter(course =>
            selectedCourse === "all" ||
            course.id === Number(selectedCourse)
        )
        .map(course => {

            const students = course.completed_students.filter(student => {

                if (selectedGradeStatus === "all") {
                    return true;
                }

                if (selectedGradeStatus === "graded") {
                    return Boolean(student.grade);
                }

                if (selectedGradeStatus === "awaiting") {
                    return !student.grade;
                }

                return true;
            });

            return {
                ...course,
                completed_students: students
            };
        });


    // Loading state.

    if (loading) {
        return <p>Loading...</p>;
    }


    // Error state.

    if (error) {
        return <p>{error}</p>;
    }


    return (
        <div className={styles.page}>

            <button
                className={styles.back}
                type="button"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <h1>Courses to Grade</h1>

            <SearchAndFilter
                showSearch={false}
                filters={[
                    {
                        id: "course-filter",
                        label: "Course:",
                        column: "left",
                        value: selectedCourse === "all" ? "" : selectedCourse,
                        onChange: value => setSelectedCourse(value || "all"),
                        defaultLabel: "All Courses",
                        options: courseOptions,
                        getValue: course => course.id,
                        getLabel: course => `${course.subject_name} (${course.code})`,
                    },
                    {
                        id: "grade-filter",
                        label: "Grade Status:",
                        column: "right",
                        value: selectedGradeStatus === "all" ? "" : selectedGradeStatus,
                        onChange: value => setSelectedGradeStatus(value || "all"),
                        defaultLabel: "All",
                        options: [
                            { value: "awaiting", label: "Awaiting Grade" },
                            { value: "graded", label: "Graded" },
                        ],
                        getValue: option => option.value,
                        getLabel: option => option.label,
                    },
                ]}
                onClear={() => {
                    setSelectedCourse("all");
                    setSelectedGradeStatus("all");
                }}
            />


            {filteredCourses.map(course => (

                <details
                    key={course.id}
                    className={styles.course}
                    open
                >
                    <summary className={styles.courseSummary}>
                        <span>{course.subject_name} ({course.code}) </span>

                        <span className={styles.gradeCount}>
                            {course.completed_students.filter(student => !student.grade).length > 0
                                ? `${course.completed_students.filter(student => !student.grade).length} awaiting grading`
                                : "All graded"}
                        </span>
                    </summary>

                    <div className={styles.courseContent}>

                        {course.completed_students.length === 0 ? (
                            <p className={styles.emptyMessage}>
                                No students match the selected filters.
                            </p>
                        ) : (
                            course.completed_students.map(student => (
                                <StudentGradeCard
                                    key={student.id}
                                    student={student}
                                    editing={editingGrades[student.id]}
                                    selectedGrade={selectedGrades[student.id]}
                                    onEdit={() =>
                                        handleEditGrade(student.id)
                                    }
                                    onGradeChange={(grade) =>
                                        handleGradeChange(
                                            student.id,
                                            grade
                                        )
                                    }
                                    onSave={() =>
                                        handleSaveGrade(student.id)
                                    }
                                    onCancel={() =>
                                        handleCancelGradeEdit(student.id)
                                    }
                                />
                            ))
                        )}

                    </div>

                </details>

            ))}

        </div>
    );

}

export default Gradebook;
