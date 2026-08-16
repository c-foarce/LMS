import { useEffect, useState } from "react";

import api from "../../services/api";

import StudentGradeCard from "../../components/DisplayCards/StudentGradeCard";

function Gradebook() {

    const [enrolments, setEnrolments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedGrades, setSelectedGrades] = useState({});
    const [editingGrades, setEditingGrades] = useState({});


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


    // Group enrolments by course.

    const courses = new Map();

    enrolments.forEach(enrolment => {

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

            {groupedCourses.map(course => (

                <section key={course.id}>

                    <h2>
                        {course.name} ({course.code})
                    </h2>

                    {course.students.map(student => (

                        // <div key={student.id}>

                        //     <p>
                        //         Student: {student.student_name}
                        //     </p>

                        //     <p>
                        //         Progress: {student.progress}%
                        //     </p>

                        //     {/*The below should be extracted to it's own component. lots of condtionals and ternary stuff */}
                        //     <p>

                        //         {student.grade ? (

                        //             <>
                        //                 Grade: {student.grade}

                        //                 {!editingGrades[student.id] && (
                        //                     <button
                        //                         onClick={() =>
                        //                             handleEditGrade(student.id)
                        //                         }
                        //                     >
                        //                         Change Grade
                        //                     </button>
                        //                 )}

                        //                 {editingGrades[student.id] && (
                        //                     <>
                        //                         <select
                        //                             value={selectedGrades[student.id] || ""}
                        //                             onChange={(event) =>
                        //                                 handleGradeChange(
                        //                                     student.id,
                        //                                     event.target.value
                        //                                 )
                        //                             }
                        //                         >
                        //                             <option value="" disabled>
                        //                                 Select grade
                        //                             </option>

                        //                             <option value="A">A</option>
                        //                             <option value="B">B</option>
                        //                             <option value="C">C</option>
                        //                             <option value="D">D</option>
                        //                             <option value="F">F</option>
                        //                         </select>

                        //                         {selectedGrades[student.id] && (
                        //                             <button
                        //                                 onClick={() =>
                        //                                     handleSaveGrade(student.id)
                        //                                 }
                        //                             >
                        //                                 Save Grade
                        //                             </button>
                        //                         )}

                        //                         <button
                        //                             onClick={() =>
                        //                                 handleCancelGradeEdit(student.id)
                        //                             }
                        //                         >
                        //                             Cancel
                        //                         </button>
                        //                     </>
                        //                 )}
                        //             </>

                        //         ) : student.progress === 100 ? (

                        //             <>
                        //                 Grade: Awaiting grade

                        //                 <select
                        //                     value={selectedGrades[student.id] || ""}
                        //                     onChange={(event) =>
                        //                         handleGradeChange(
                        //                             student.id,
                        //                             event.target.value
                        //                         )
                        //                     }
                        //                 >
                        //                     <option value="" disabled>
                        //                         Select grade
                        //                     </option>

                        //                     <option value="A">A</option>
                        //                     <option value="B">B</option>
                        //                     <option value="C">C</option>
                        //                     <option value="D">D</option>
                        //                     <option value="F">F</option>
                        //                 </select>

                        //                 {selectedGrades[student.id] && (
                        //                     <button
                        //                         onClick={() =>
                        //                             handleSaveGrade(student.id)
                        //                         }
                        //                     >
                        //                         Save Grade
                        //                     </button>
                        //                 )}
                        //             </>

                        //         ) : (

                        //             <>
                        //                 Grade: Not available
                        //             </>

                        //         )}

                        //     </p>

                        //     <p>-----</p>

                        // </div>

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

            ))}

        </>
    );
}

export default Gradebook;