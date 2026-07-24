from django.test import TestCase
from django.db import IntegrityError


from accounts.models import User

from .models import Course, Enrolment

# Create your tests here.

class CourseModelTests(TestCase):

    def test_create_course(self):

        teacher = User.objects.create_user(
            username = "teacher_test",
            password = "password123",
            role = "teacher"
        )

        course = Course.objects.create(
            subject_name = "Physics",
            code = "PHY101",
            teacher = teacher
        )


        self.assertEqual(course.subject_name, "Physics")
        self.assertEqual(course.code, "PHY101")
        self.assertEqual(course.teacher.username, "teacher_test")
        self.assertEqual(course.teacher, teacher)



    def test_course_reference(self):

        teacher=User.objects.create_user(
            username="teacher_test",
            password="password123",
            role="teacher"
        )
        course=Course.objects.create(
            subject_name="Maths",
            code="MATHS101",
            teacher=teacher 
        )


        self.assertEqual(str(course), "Maths: MATHS101")



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



    def test_enrolment_creation(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course
        )
        self.assertEqual(enrolment.student, self.student)
        self.assertEqual(enrolment.course, self.course)
        self.assertEqual(enrolment.status, Enrolment.Status.ACTIVE)



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
