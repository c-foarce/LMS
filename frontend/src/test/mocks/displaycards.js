export const mockCourse = {
    id: 1,
    subject_name: "Mathematics",
    code: "MATH101",
    teacher_name: "John Smith",
    is_active: true,
    total_submissions: 6,
};

export const mockInactiveCourse = {
    id: 2,
    subject_name: "Physics",
    code: "PHYS101",
    teacher_name: "Jane Smith",
    is_active: false,
    total_submissions: 4,
};

export const mockEnrolment = {
    course_name: "Mathematics",
    course_code: "MATH101",
    teacher: "John Smith",
    status: "Active",
    progress: 50,
    grade: "B",
};

export const mockEnrolmentNoTeacher = {
    course_name: "Physics",
    course_code: "PHYS101",
    teacher: null,
    status: "Completed",
    progress: 100,
    grade: null,
};