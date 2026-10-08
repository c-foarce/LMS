import { useEffect, useState } from "react";

import api from "../../services/api";
import FilterDropdown from "../../components/Filters/FilterDropdown";
import styles from "./MyGrades.module.css";

function MyGrades() {
    const [grades, setGrades] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [teacherFilter, setTeacherFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await api.get(
                    "/courses/enrolments/my-grades/"
                );

                setGrades(response.data);
            } catch (error) {
                setError("Failed to Load grades.");
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    const teachers = [
        ...new Set(
            grades
                .map((grade) => grade.teacher_username)
                .filter(Boolean)
        ),
    ].sort();

    const gradeOptions = [
        ...new Set(
            grades
                .map((grade) => grade.grade)
                .filter(Boolean)
        ),
    ].sort();

    const filteredGrades = grades.filter((grade) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            grade.course_name.toLowerCase().includes(search) ||
            grade.course_code.toLowerCase().includes(search) ||
            grade.teacher_username.toLowerCase().includes(search);

        const matchesTeacher =
            !teacherFilter ||
            grade.teacher_username === teacherFilter;

        const matchesGrade =
            !gradeFilter ||
            grade.grade === gradeFilter;

        const completedDate = grade.completed_at.slice(0, 10);

        const matchesFromDate =
            !fromDate ||
            completedDate >= fromDate;

        const matchesToDate =
            !toDate ||
            completedDate <= toDate;

        return (
            matchesSearch &&
            matchesTeacher &&
            matchesGrade &&
            matchesFromDate &&
            matchesToDate
        );
    });

    const clearFilters = () => {
        setSearchTerm("");
        setTeacherFilter("");
        setGradeFilter("");
        setFromDate("");
        setToDate("");
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <main className={styles.page}>
            <h1>My Grades</h1>

            {grades.length === 0 ? (
                <p className={styles.empty}>
                    You don't have any graded courses yet.
                </p>
            ) : (
                <>
                    <section className={styles.filters}>
                        <div className={styles.searchField}>
                            <label htmlFor="grade-search">
                                Search:
                            </label>

                            <input
                                id="grade-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search courses or teachers..."
                            />
                        </div>

                        <div className={styles.filterRow}>
                            <FilterDropdown
                                id="teacher-filter"
                                label="Teacher"
                                value={teacherFilter}
                                onChange={setTeacherFilter}
                                defaultLabel="All Teachers"
                                options={teachers}
                                getValue={(teacher) => teacher}
                                getLabel={(teacher) => teacher}
                            />

                            <FilterDropdown
                                id="grade-filter"
                                label="Grade"
                                value={gradeFilter}
                                onChange={setGradeFilter}
                                defaultLabel="All Grades"
                                options={gradeOptions}
                                getValue={(grade) => grade}
                                getLabel={(grade) => grade}
                            />

                            <div className={styles.dateRange}>
                                <div className={styles.dateField}>
                                    <label htmlFor="from-date">
                                        From:
                                    </label>

                                    <input
                                        id="from-date"
                                        type="date"
                                        value={fromDate}
                                        onChange={(event) =>
                                            setFromDate(event.target.value)
                                        }
                                    />
                                </div>

                                <div className={styles.dateField}>
                                    <label htmlFor="to-date">
                                        To:
                                    </label>

                                    <input
                                        id="to-date"
                                        type="date"
                                        value={toDate}
                                        onChange={(event) =>
                                            setToDate(event.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                className={styles.clearButton}
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </section>

                    {filteredGrades.length === 0 ? (
                        <p className={styles.empty}>
                            No grades match your filters.
                        </p>
                    ) : (
                        <section className={styles.list}>
                            {filteredGrades.map((grade) => (
                                <article
                                    className={styles.card}
                                    key={grade.id}
                                >
                                    <h2>
                                        {grade.course_name} (
                                        {grade.course_code})
                                    </h2>

                                    <p>
                                        <strong>Teacher:</strong>{" "}
                                        {grade.teacher_username}
                                    </p>

                                    <p>
                                        <strong>Grade:</strong>{" "}
                                        {grade.grade}
                                    </p>

                                    <p>
                                        <strong>Completed:</strong>{" "}
                                        {new Date(
                                            grade.completed_at
                                        ).toLocaleDateString("en-GB")}
                                    </p>
                                </article>
                            ))}
                        </section>
                    )}
                </>
            )}
        </main>
    );
}

export default MyGrades;