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