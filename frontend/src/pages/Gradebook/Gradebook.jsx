import { useEffect, useState } from "react";

import api from "../../services/api";

import StudentGradeCard from "../../components/DisplayCards/StudentGradeCard";

function Gradebook() {

    const [enrolments, setEnrolments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedGrades, setSelectedGrades] = useState({});
    const [editingGrades, setEditingGrades] = useState({});

    const [selectedCourse, setSelectedCourse] = useState("all")
    const [selectedGradeStatus, setSelectedGradeStatus] = useState("all")


    useEffect(() => {

        const fetchProgress = async () => {

            try {

                const response = await api.get(
                    "/courses/teaching/progress/"
                );

                console.log(
                    "TEACHER PROGRESS:",
                    response.data
                );

                setEnrolments(response.data);

            } catch (error) {

                console.error(error);

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

            console.log("patch success");

            setEnrolments(previousEnrolments =>
                previousEnrolments.map(enrolment =>
                    enrolment.id === enrolmentId
                        ? {
                            ...enrolment,
                            grade: selectedGrades[enrolmentId]
                        }
                        : enrolment
                )
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

            console.error(
                "Grade submission failed:",
                error
            );

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

    const availableCourses = new Map();

    enrolments.forEach(enrolment => {

        if (!availableCourses.has(enrolment.course)) {

            availableCourses.set(enrolment.course, {
                id: enrolment.course,
                name: enrolment.course_name,
                code: enrolment.course_code
            });

        }

    });

    const courseOptions = Array.from(
        availableCourses.values()
    );


    // Group enrolments by course, and those that need grading

    const filteredEnrolments = enrolments.filter(enrolment => {

        const matchesCourse =
            selectedCourse === "all" ||
            enrolment.course === Number(selectedCourse);

        const matchesGrade =
            selectedGradeStatus === "all" ||
            (selectedGradeStatus === "graded" && enrolment.grade) ||
            (selectedGradeStatus === "awaiting" && !enrolment.grade);

        return matchesCourse && matchesGrade;
    });

    const courses = new Map();

    filteredEnrolments.forEach(enrolment => {

        if (!courses.has(enrolment.course)) {

            courses.set(enrolment.course, {
                id: enrolment.course,
                name: enrolment.course_name,
                code: enrolment.course_code,
                students: []
            });

        }

        courses
            .get(enrolment.course)
            .students
            .push(enrolment);

    });

    const groupedCourses = Array.from(
        courses.values()
    );


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
            <h1>Courses to Grade</h1>

            <div>
                <label htmlFor="course-filter">Course:</label>

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
                            {course.name} ({course.code})
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


            {groupedCourses.length === 0 ? (
                <p>
                    No student match the selected filters.
                </p>
            ) : (groupedCourses.map(course => (

                <section key={course.id}>

                    <h2>
                        {course.name} ({course.code})
                    </h2>

                    {course.students.map(student => (

                        <StudentGradeCard
                            key={student.id}
                            student={student}
                            editing={editingGrades[student.id]}
                            selectedGrade={selectedGrades[student.id]}
                            onEdit={() => handleEditGrade(student.id)}
                            onGradeChange={(grade) =>
                                handleGradeChange(student.id, grade)
                            }
                            onSave={() =>
                                handleSaveGrade(student.id)
                            }
                            onCancel={() =>
                                handleCancelGradeEdit(student.id)
                            }
                        />

                    ))}

                </section>

            )))}



        </>
    );
}

export default Gradebook;