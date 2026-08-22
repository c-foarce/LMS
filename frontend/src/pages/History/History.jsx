import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

import HistoryRecord from "../../components/DisplayCards/HistoryRecord";

import FilterDropdown from "../../components/Filters/FilterDropdown";

function History() {

    const { user } = useAuth()

    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //for searching/filtering:
    const [search, setSearch] = useState("");

    const [studentFilter, setStudentFilter] = useState("");
    const [teacherFilter, setTeacherFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");


    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const response = await api.get(
                    "/courses/enrolments/history/"
                );

                setRecords(response.data);

                console.log("History:", response.data);

            } catch (error) {

                console.error("Failed to retrieve history:", error);

                setError(
                    error.response?.data?.detail ||
                    "Failed to retrieve course history."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchHistory();

    }, []);


    const createPersonOptions = (
        records,
        usernameField,
        firstNameField,
        lastNameField
    ) => {

        return [
            ...new Map(
                records.map(record => [
                    record[usernameField],
                    {
                        username: record[usernameField],
                        firstName: record[firstNameField],
                        lastName: record[lastNameField],
                    }
                ])
            ).values()
        ];
    };

    const createCourseOptions = (records) => {

        return [
            ...new Map(
                records.map(record => [
                    record.course_id,
                    {
                        id: record.course_id,
                        code: record.course_code,
                        name: record.course_name,
                    }
                ])
            ).values()
        ];

    };

    const clearFilters = () => {

        setSearch("");
        setStudentFilter("");
        setTeacherFilter("");
        setCourseFilter("");
        setGradeFilter("");

    };


    //Creating the filter dropdown options

    const students = createPersonOptions(
        records,
        "student_username",
        "student_first_name",
        "student_last_name"
    );

    const teachers = createPersonOptions(
        records,
        "teacher_username",
        "teacher_first_name",
        "teacher_last_name"
    );

    const courses = createCourseOptions(records);

    const grades = [
        ...new Set(
            records.map(record => record.grade)
        )
    ];


    const filteredRecords = records.filter(record => {

        const searchTerm = search.toLowerCase();

        const matchesSearch =
            record.student_username?.toLowerCase().includes(searchTerm) ||
            record.student_first_name?.toLowerCase().includes(searchTerm) ||
            record.student_last_name?.toLowerCase().includes(searchTerm) ||
            record.teacher_username?.toLowerCase().includes(searchTerm) ||
            record.teacher_first_name?.toLowerCase().includes(searchTerm) ||
            record.teacher_last_name?.toLowerCase().includes(searchTerm) ||
            record.course_name?.toLowerCase().includes(searchTerm) ||
            record.course_code?.toLowerCase().includes(searchTerm);

        const matchesStudent =
            !studentFilter ||
            record.student_username === studentFilter;

        const matchesTeacher =
            !teacherFilter ||
            record.teacher_username === teacherFilter;

        const matchesCourse =
            !courseFilter ||
            record.course_id === Number(courseFilter);

        const matchesGrade =
            !gradeFilter ||
            record.grade === gradeFilter;

        return (
            matchesSearch &&
            matchesStudent &&
            matchesTeacher &&
            matchesCourse &&
            matchesGrade
        );
    });


    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }


    return (
        <>
            <div>
                <h1>
                    {user?.role === "admin"
                        ? "Course History"
                        : "My Course History"
                    }
                </h1>
                <div>
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <FilterDropdown
                        value={studentFilter}
                        onChange={setStudentFilter}
                        defaultLabel="All Students"
                        options={students}
                        getValue={student => student.username}
                        getLabel={student =>
                            `${student.username} - ${student.firstName} ${student.lastName}`
                        }
                    />

                    {user?.role === "admin" && (
                        <FilterDropdown
                            value={teacherFilter}
                            onChange={setTeacherFilter}
                            defaultLabel="All Teachers"
                            options={teachers}
                            getValue={teacher => teacher.username}
                            getLabel={teacher =>
                                `${teacher.username} - ${teacher.firstName} ${teacher.lastName}`
                            }
                        />
                    )}

                    <FilterDropdown
                        value={courseFilter}
                        onChange={setCourseFilter}
                        defaultLabel="All Courses"
                        options={courses}
                        getValue={course => course.id}
                        getLabel={course =>
                            `${course.code} - ${course.name}`
                        }
                    />

                    <FilterDropdown
                        value={gradeFilter}
                        onChange={setGradeFilter}
                        defaultLabel="All Grades"
                        options={grades}
                        getValue={grade => grade}
                        getLabel={grade => grade}
                    />

                    <button onClick={clearFilters}>
                        Clear Filters
                    </button>
                    
                </div>


                {records.length === 0 ? (

                    <p>No completed courses found.</p>

                ) : filteredRecords.length === 0 ? (

                    <p>No records match your current filters.</p>

                ) : (

                    filteredRecords.map(record => (
                        <HistoryRecord
                            key={record.id}
                            record={record}
                        />
                    ))

                )}
            </div>
        </>
    );
}

export default History;