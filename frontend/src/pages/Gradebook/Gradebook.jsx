import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import StudentGradeCard from "../../components/GradeCards/StudentGradeCard";

function Gradebook() {

    const navigate = useNavigate()

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
        <>

            <div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
            </div>

            <h1>Courses to Grade</h1>


            <div>
                <label htmlFor="course-filter">
                    Course:
                </label>

                <select
                    id="course-filter"
                    value={selectedCourse}
                    onChange={(event) =>
                        setSelectedCourse(event.target.value)
                    }
                >
                    <option value="all">
                        All Courses
                    </option>

                    {courseOptions.map(course => (
                        <option
                            key={course.id}
                            value={course.id}
                        >
                            {course.subject_name} ({course.code})
                        </option>
                    ))}

                </select>

            </div>


            <div>

                <label htmlFor="grade-filter">
                    Grade Status:
                </label>

                <select
                    id="grade-filter"
                    value={selectedGradeStatus}
                    onChange={(event) =>
                        setSelectedGradeStatus(event.target.value)
                    }
                >
                    <option value="all">
                        All
                    </option>

                    <option value="awaiting">
                        Awaiting Grade
                    </option>

                    <option value="graded">
                        Graded
                    </option>

                </select>

            </div>


            {filteredCourses.map(course => (

                <details key={course.id} open>

                    <summary>
                        {course.subject_name} ({course.code})
                    </summary>

                    {course.completed_students.length === 0 ? (
                        <p>
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

                </details>

            ))}

        </>
    );
}

export default Gradebook;