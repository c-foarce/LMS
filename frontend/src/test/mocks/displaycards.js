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
    id: 1,
    course_name: "Mathematics",
    course_code: "MATH101",
    student_name: "teststudent",
    teacher: "testteacher",
    status: "Active",
    progress: 50,
    grade: null,
};

export const mockEnrolmentNoTeacher = {
    id: 2,
    course_name: "Physics",
    course_code: "PHYS101",
    student_name: "teststudent2",
    teacher: null,
    status: "Active",
    progress: 70,
    grade: null,
};

export const mockCompletedEnrolment = {
    id: 3,
    course_name: "English",
    course_code: "ENG101",
    student_name: "teststudent",
    teacher: "testteacher2",
    status: "Completed",
    progress: 100,
    grade: null
}