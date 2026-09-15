from django.test import TestCase
from django.db import IntegrityError

from accounts.models import User

from courses.models import Course, Enrolment, CompletedEnrolment


class CourseModelTests(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            username="teacher",
            password="password123",
            role="teacher"
        )

    def test_create_course(self):
        course = Course.objects.create(
            subject_name="Physics",
            code="PHY101",
            teacher=self.teacher
        )

        self.assertEqual(course.subject_name, "Physics")
        self.assertEqual(course.code, "PHY101")
        self.assertEqual(course.teacher, self.teacher)

    def test_course_string_representation(self):
        course = Course.objects.create(
            subject_name="Maths",
            code="MATHS101",
            teacher=self.teacher
        )

        self.assertEqual(str(course), "Maths MATHS101")

    def test_total_submissions_defaults_to_one(self):
        course = Course.objects.create(
            subject_name="Physics",
            teacher=self.teacher
        )

        self.assertEqual(course.total_submissions, 1)

    def test_course_is_active_by_default(self):
        course = Course.objects.create(
            subject_name="Physics",
            teacher=self.teacher
        )

        self.assertTrue(course.is_active)

    def test_course_can_have_no_code(self):
        course = Course.objects.create(
            subject_name="Physics",
            teacher=self.teacher
        )

        self.assertIsNone(course.code)

    def test_course_can_have_description(self):
        course = Course.objects.create(
            subject_name="Physics",
            teacher=self.teacher,
            description="Introduction to physics."
        )

        self.assertEqual(
            course.description,
            "Introduction to physics."
        )

    def test_course_can_have_no_description(self):
        course = Course.objects.create(
            subject_name="Physics",
            teacher=self.teacher
        )

        self.assertEqual(course.description, "")

    def test_course_teacher_can_be_null(self):
        course = Course.objects.create(
            subject_name="Physics",
            teacher=None
        )

        self.assertIsNone(course.teacher)

    def test_duplicate_subject_and_code_not_allowed(self):
        Course.objects.create(
            subject_name="Physics",
            code="PHY101",
            teacher=self.teacher
        )

        with self.assertRaises(IntegrityError):
            Course.objects.create(
                subject_name="Physics",
                code="PHY101",
                teacher=self.teacher
            )

    def test_same_subject_with_different_codes_is_allowed(self):
        course1 = Course.objects.create(
            subject_name="Physics",
            code="PHY101",
            teacher=self.teacher
        )

        course2 = Course.objects.create(
            subject_name="Physics",
            code="PHY102",
            teacher=self.teacher
        )

        self.assertNotEqual(course1.id, course2.id)


class EnrolmentModelTests(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            username="teacher",
            password="password123",
            role="teacher"
        )

        self.student = User.objects.create_user(
            username="student",
            password="password123",
            role="student"
        )

        self.course = Course.objects.create(
            subject_name="Physics",
            code="PHY101",
            teacher=self.teacher
        )

    def test_create_enrolment(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        self.assertEqual(enrolment.student, self.student)
        self.assertEqual(enrolment.course, self.course)

    def test_enrolment_string_representation(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        self.assertEqual(
            str(enrolment),
            "student enrolled in Physics"
        )

    def test_status_defaults_to_active(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        self.assertEqual(
            enrolment.status,
            Enrolment.Status.ACTIVE
        )

    def test_completed_submissions_defaults_to_zero(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        self.assertEqual(
            enrolment.completed_submissions,
            0
        )

    def test_grade_defaults_to_blank(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        self.assertEqual(enrolment.grade, "")

    def test_student_completed_defaults_to_false(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        self.assertFalse(enrolment.student_completed)

    def test_enrolment_can_store_progress(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course,
            completed_submissions=3
        )

        self.assertEqual(
            enrolment.completed_submissions,
            3
        )

    def test_enrolment_can_store_grade(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course,
            grade="A"
        )

        self.assertEqual(enrolment.grade, "A")

    def test_enrolment_can_be_marked_completed_by_student(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course,
            student_completed=True
        )

        self.assertTrue(enrolment.student_completed)

    def test_duplicate_enrolments_not_allowed(self):
        Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        with self.assertRaises(IntegrityError):
            Enrolment.objects.create(
                student=self.student,
                course=self.course
            )

    def test_different_students_can_enrol_on_same_course(self):
        second_student = User.objects.create_user(
            username="student2",
            password="password123",
            role="student"
        )

        enrolment1 = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        enrolment2 = Enrolment.objects.create(
            student=second_student,
            course=self.course
        )

        self.assertNotEqual(enrolment1.id, enrolment2.id)

    def test_student_can_enrol_on_different_courses(self):
        second_course = Course.objects.create(
            subject_name="Maths",
            code="MATH101",
            teacher=self.teacher
        )

        enrolment1 = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        enrolment2 = Enrolment.objects.create(
            student=self.student,
            course=second_course
        )

        self.assertNotEqual(enrolment1.id, enrolment2.id)

    def test_enrolment_status_choices(self):
        self.assertEqual(
            Enrolment.Status.ACTIVE,
            "active"
        )

        self.assertEqual(
            Enrolment.Status.COMPLETED,
            "completed"
        )

        self.assertEqual(
            Enrolment.Status.DROPPED,
            "dropped"
        )


class CompletedEnrolmentModelTests(TestCase):

    def setUp(self):
        self.completed_data = {
            "original_enrolment_id": 1,
            "student_id": 10,
            "student_username": "student",
            "student_first_name": "Test",
            "student_last_name": "Student",
            "teacher_id": 20,
            "teacher_username": "teacher",
            "teacher_first_name": "Test",
            "teacher_last_name": "Teacher",
            "course_id": 30,
            "course_name": "Physics",
            "course_code": "PHY101",
            "grade": "A",
        }

    def test_create_completed_enrolment(self):
        completed = CompletedEnrolment.objects.create(
            **self.completed_data
        )

        self.assertEqual(
            completed.original_enrolment_id,
            1
        )

        self.assertEqual(
            completed.student_id,
            10
        )

        self.assertEqual(
            completed.student_username,
            "student"
        )

        self.assertEqual(
            completed.course_name,
            "Physics"
        )

        self.assertEqual(
            completed.grade,
            "A"
        )

    def test_completed_enrolment_string_representation(self):
        completed = CompletedEnrolment.objects.create(
            **self.completed_data
        )

        self.assertEqual(
            str(completed),
            "student - Physics"
        )

    def test_original_enrolment_id_must_be_unique(self):
        CompletedEnrolment.objects.create(
            **self.completed_data
        )

        duplicate_data = self.completed_data.copy()
        duplicate_data["student_username"] = "another_student"

        with self.assertRaises(IntegrityError):
            CompletedEnrolment.objects.create(
                **duplicate_data
            )

    def test_teacher_id_can_be_null(self):
        data = self.completed_data.copy()
        data["teacher_id"] = None

        completed = CompletedEnrolment.objects.create(
            **data
        )

        self.assertIsNone(completed.teacher_id)

    def test_course_code_can_be_null(self):
        data = self.completed_data.copy()
        data["course_code"] = None

        completed = CompletedEnrolment.objects.create(
            **data
        )

        self.assertIsNone(completed.course_code)

    def test_completed_at_is_set_automatically(self):
        completed = CompletedEnrolment.objects.create(
            **self.completed_data
        )

        self.assertIsNotNone(completed.completed_at)