export const mockActiveEnrolment = {
    id: 1,
    student_name: "teststudent",
    course: 1,
    course_name: "Mathematics",
    course_code: "MATH101",
    teacher: "teacherone",
    status: "active",
    completed_submissions: 3,
    progress: 50,
    grade: "",
    student_completed: false,
    enrolled_at: "2026-08-01T10:00:00Z",
};


export const mockSecondActiveEnrolment = {
    id: 2,
    student_name: "teststudent",
    course: 2,
    course_name: "Computer Science",
    course_code: "CS101",
    teacher: "teachertwo",
    status: "active",
    completed_submissions: 2,
    progress: 25,
    grade: "",
    student_completed: false,
    enrolled_at: "2026-08-05T10:00:00Z",
};


export const mockAwaitingCompletion = {
    id: 3,
    student_name: "teststudent",
    course: 3,
    course_name: "History",
    course_code: "HIST101",
    teacher: "teacherthree",
    status: "completed",
    completed_submissions: 6,
    progress: 100,
    grade: "A",
    student_completed: false,
    enrolled_at: "2026-07-01T10:00:00Z",
};


export const mockCompletedEnrolment = {
    id: 10,
    original_enrolment_id: 3,
    student_id: 1,
    student_username: "teststudent",
    student_first_name: "Test",
    student_last_name: "Student",
    teacher_id: 2,
    teacher_username: "teacherone",
    teacher_first_name: "Test",
    teacher_last_name: "Teacher",
    course_id: 3,
    course_name: "History",
    course_code: "HIST101",
    grade: "A",
    completed_at: "2026-08-20T12:00:00Z",
};


export const mockSecondCompletedEnrolment = {
    id: 11,
    original_enrolment_id: 4,
    student_id: 1,
    student_username: "teststudent",
    student_first_name: "Test",
    student_last_name: "Student",
    teacher_id: 3,
    teacher_username: "teachertwo",
    teacher_first_name: "Test",
    teacher_last_name: "Teacher",
    course_id: 4,
    course_name: "English",
    course_code: "ENG101",
    grade: "B",
    completed_at: "2026-08-10T12:00:00Z",
};




export const mockTeacherCourses = [
    {
        id: 1,
        subject_name: "Mathematics",
        code: "MATH101",
        is_active: true,
        total_students: 10,
        active_students: 6,
        completed_students: 0,
        dropped_students: 4,
    },
    {
        id: 2,
        subject_name: "Computer Science",
        code: "CS101",
        is_active: false,
        total_students: 5,
        active_students: 2,
        completed_students: 2,
        dropped_students: 1,
    },
];


export const mockTeacherProgress = [
    {
        id: 1,
        subject_name: "Mathematics",
        code: "MATH101",
        completed_students: [
            {
                id: 1,
                student_name: "studentone",
                course: 1,
                course_name: "Mathematics",
                course_code: "MATH101",
                teacher: "teacherone",
                status: "completed",
                completed_submissions: 6,
                progress: 100,
                grade: "",
                student_completed: false,
                enrolled_at: "2026-08-01T10:00:00Z",
            },
            {
                id: 2,
                student_name: "studenttwo",
                course: 1,
                course_name: "Mathematics",
                course_code: "MATH101",
                teacher: "teacherone",
                status: "completed",
                completed_submissions: 6,
                progress: 100,
                grade: "A",
                student_completed: false,
                enrolled_at: "2026-08-01T10:00:00Z",
            },
        ],
    },
    {
        id: 2,
        subject_name: "Computer Science",
        code: "CS101",
        completed_students: [
            {
                id: 3,
                student_name: "studentthree",
                course: 2,
                course_name: "Computer Science",
                course_code: "CS101",
                teacher: "teacherone",
                status: "completed",
                completed_submissions: 5,
                progress: 100,
                grade: "",
                student_completed: false,
                enrolled_at: "2026-08-02T10:00:00Z",
            },
        ],
    },
];


export const mockAdminUsers = [
    {
        id: 1,
        username: "studentone",
        first_name: "Student",
        last_name: "One",
        email: "student@example.com",
        role: "student",
    },
    {
        id: 2,
        username: "teacherone",
        first_name: "Teacher",
        last_name: "One",
        email: "teacher@example.com",
        role: "teacher",
    },
    {
        id: 3,
        username: "adminone",
        first_name: "Admin",
        last_name: "One",
        email: "admin@example.com",
        role: "admin",
    },
];


export const mockAdminCourses = [
    {
        id: 1,
        subject_name: "Mathematics",
        code: "MATH101",
        is_active: true,
        teacher_name: "teacherone",
        total_submissions: 6,
    },
    {
        id: 2,
        subject_name: "Computer Science",
        code: "CS101",
        is_active: false,
        teacher_name: "teacherone",
        total_submissions: 5,
    },
];


export const mockAdminEnrolments = [
    {
        id: 1,
        student_name: "studentone",
        course: 1,
        course_name: "Mathematics",
        course_code: "MATH101",
        teacher: "teacherone",
        status: "active",
        completed_submissions: 3,
        progress: 50,
        grade: "",
        student_completed: false,
        enrolled_at: "2026-08-01T10:00:00Z",
    },
    {
        id: 2,
        student_name: "studenttwo",
        course: 1,
        course_name: "Mathematics",
        course_code: "MATH101",
        teacher: "teacherone",
        status: "completed",
        completed_submissions: 6,
        progress: 100,
        grade: "A",
        student_completed: false,
        enrolled_at: "2026-08-01T10:00:00Z",
    },
    {
        id: 3,
        student_name: "studentthree",
        course: 2,
        course_name: "Computer Science",
        course_code: "CS101",
        teacher: "teacherone",
        status: "dropped",
        completed_submissions: 1,
        progress: 20,
        grade: "",
        student_completed: false,
        enrolled_at: "2026-08-02T10:00:00Z",
    },
];