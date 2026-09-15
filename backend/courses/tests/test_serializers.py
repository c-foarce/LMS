from django.test import TestCase
from rest_framework.test import APIRequestFactory

from accounts.models import User

from courses.models import Course, Enrolment, CompletedEnrolment
from courses.serializers import (
    EnrolmentSerializer,
    CourseSerializer,
    CourseListSerializer,
    CreateEnrolmentSerializer,
    StudentEnrolmentSerializer,
    # SubmitProgressSerializer,
    GradeEnrolmentSerializer,
    TeacherCourseProgressSerializer,
    CompletedEnrolmentSerializer,
    TeacherDashboardSerializer,
    TeacherCourseSerializer,
)


class SerializerTestMixin:

    def create_user(
        self,
        username,
        role="student",
        first_name="",
        last_name="",
    ):
        return User.objects.create_user(
            username=username,
            password="password123",
            role=role,
            first_name=first_name,
            last_name=last_name,
        )

    def create_course(
        self,
        subject_name="Physics",
        code="PHY101",
        teacher=None,
        total_submissions=5,
        is_active=True,
    ):
        return Course.objects.create(
            subject_name=subject_name,
            code=code,
            teacher=teacher,
            total_submissions=total_submissions,
            is_active=is_active,
        )

    def create_request(self, user):
        request = APIRequestFactory().get("/")
        request.user = user
        return request


class EnrolmentSerializerTests(SerializerTestMixin, TestCase):

    def setUp(self):
        self.teacher = self.create_user(
            "teacher",
            role="teacher",
            first_name="Test",
            last_name="Teacher",
        )

        self.student = self.create_user(
            "student",
            role="student",
            first_name="Test",
            last_name="Student",
        )

        self.course = self.create_course(
            teacher=self.teacher,
            total_submissions=4,
        )

        self.enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course,
            completed_submissions=2,
            grade="B",
            student_completed=True,
        )

    def test_serializes_expected_fields(self):
        data = EnrolmentSerializer(self.enrolment).data

        expected_fields = {
            "id",
            "student_name",
            "course",
            "course_name",
            "course_code",
            "teacher",
            "status",
            "completed_submissions",
            "progress",
            "grade",
            "student_completed",
            "enrolled_at",
        }

        self.assertEqual(set(data.keys()), expected_fields)

    def test_student_name_comes_from_student_username(self):
        data = EnrolmentSerializer(self.enrolment).data

        self.assertEqual(
            data["student_name"],
            "student",
        )

    def test_course_name_comes_from_subject_name(self):
        data = EnrolmentSerializer(self.enrolment).data

        self.assertEqual(
            data["course_name"],
            "Physics",
        )

    def test_course_code_comes_from_course(self):
        data = EnrolmentSerializer(self.enrolment).data

        self.assertEqual(
            data["course_code"],
            "PHY101",
        )

    def test_teacher_name_comes_from_course_teacher(self):
        data = EnrolmentSerializer(self.enrolment).data

        self.assertEqual(
            data["teacher"],
            "teacher",
        )

    def test_progress_is_calculated_as_percentage(self):
        data = EnrolmentSerializer(self.enrolment).data

        self.assertEqual(data["progress"], 50)

    def test_progress_is_rounded(self):
        self.enrolment.completed_submissions = 1
        self.enrolment.save()

        data = EnrolmentSerializer(self.enrolment).data

        self.assertEqual(data["progress"], 25)

    def test_zero_total_submissions_returns_zero_progress(self):
        self.course.total_submissions = 0
        self.course.save()

        data = EnrolmentSerializer(self.enrolment).data

        self.assertEqual(data["progress"], 0)

    def test_derived_fields_are_read_only(self):
        serializer = EnrolmentSerializer()

        self.assertTrue(
            serializer.fields["student_name"].read_only
        )

        self.assertTrue(
            serializer.fields["course_name"].read_only
        )

        self.assertTrue(
            serializer.fields["course_code"].read_only
        )

        self.assertTrue(
            serializer.fields["teacher"].read_only
        )

        self.assertTrue(
            serializer.fields["progress"].read_only
        )


class CourseSerializerTests(SerializerTestMixin, TestCase):

    def setUp(self):
        self.teacher = self.create_user(
            "teacher",
            role="teacher",
        )

        self.course = self.create_course(
            teacher=self.teacher,
            total_submissions=8,
        )

    def test_serializes_expected_fields(self):
        data = CourseSerializer(self.course).data

        expected_fields = {
            "id",
            "subject_name",
            "code",
            "description",
            "teacher",
            "total_submissions",
            "teacher_name",
            "created_at",
            "is_active",
        }

        self.assertEqual(set(data.keys()), expected_fields)

    def test_teacher_name_is_username(self):
        data = CourseSerializer(self.course).data

        self.assertEqual(
            data["teacher_name"],
            "teacher",
        )

    def test_teacher_name_is_read_only(self):
        serializer = CourseSerializer()

        self.assertTrue(
            serializer.fields["teacher_name"].read_only
        )

    def test_course_can_be_deserialized_with_writable_fields(self):
        data = {
            "subject_name": "Chemistry",
            "code": "CHEM101",
            "description": "Chemistry course",
            "teacher": self.teacher.id,
            "total_submissions": 6,
            "is_active": True,
        }

        serializer = CourseSerializer(data=data)

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )


class CourseListSerializerTests(SerializerTestMixin, TestCase):

    def setUp(self):
        self.teacher = self.create_user(
            "teacher",
            role="teacher",
        )

        self.course = self.create_course(
            teacher=self.teacher,
        )

    def test_serializes_expected_fields(self):
        data = CourseListSerializer(self.course).data

        expected_fields = {
            "id",
            "subject_name",
            "code",
            "is_active",
            "teacher_name",
            "total_submissions",
        }

        self.assertEqual(set(data.keys()), expected_fields)

    def test_teacher_name_is_username(self):
        data = CourseListSerializer(self.course).data

        self.assertEqual(
            data["teacher_name"],
            "teacher",
        )

    def test_teacher_name_is_read_only(self):
        serializer = CourseListSerializer()

        self.assertTrue(
            serializer.fields["teacher_name"].read_only
        )


class CreateEnrolmentSerializerTests(SerializerTestMixin, TestCase):

    def setUp(self):
        self.admin = self.create_user(
            "admin",
            role="admin",
        )

        self.teacher = self.create_user(
            "teacher",
            role="teacher",
        )

        self.other_teacher = self.create_user(
            "other_teacher",
            role="teacher",
        )

        self.student = self.create_user(
            "student",
            role="student",
        )

        self.course = self.create_course(
            teacher=self.teacher,
        )

        self.other_course = self.create_course(
            subject_name="Maths",
            code="MATH101",
            teacher=self.other_teacher,
        )

    def serializer_for(self, user, data):
        return CreateEnrolmentSerializer(
            data=data,
            context={
                "request": self.create_request(user)
            },
        )

    def test_admin_can_enrol_student(self):
        serializer = self.serializer_for(
            self.admin,
            {
                "student": self.student.id,
                "course": self.course.id,
            },
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

    def test_teacher_can_enrol_student_on_own_course(self):
        serializer = self.serializer_for(
            self.teacher,
            {
                "student": self.student.id,
                "course": self.course.id,
            },
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

    def test_teacher_cannot_enrol_student_on_other_teachers_course(self):
        serializer = self.serializer_for(
            self.teacher,
            {
                "student": self.student.id,
                "course": self.other_course.id,
            },
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "You can only create enrolments for your own courses.",
            str(serializer.errors),
        )

    def test_inactive_course_is_rejected(self):
        self.course.is_active = False
        self.course.save()

        serializer = self.serializer_for(
            self.admin,
            {
                "student": self.student.id,
                "course": self.course.id,
            },
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "This course is no longer accepting enrolments.",
            str(serializer.errors),
        )

    def test_duplicate_enrolment_is_rejected(self):
        Enrolment.objects.create(
            student=self.student,
            course=self.course
        )

        serializer = self.serializer_for(
        self.admin,
            {
                "student": self.student.id,
                "course": self.course.id,
            },
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "non_field_errors",
            serializer.errors,
        )


class StudentEnrolmentSerializerTests(SerializerTestMixin, TestCase):

    def setUp(self):
        self.student = self.create_user(
            "student",
            role="student",
        )

        self.course = self.create_course()

        self.request = self.create_request(
            self.student
        )

    def test_serializes_only_course(self):
        enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course,
        )

        data = StudentEnrolmentSerializer(enrolment).data

        self.assertEqual(
            set(data.keys()),
            {"course"},
        )

    def test_active_course_is_valid(self):
        serializer = StudentEnrolmentSerializer(
            data={"course": self.course.id},
            context={"request": self.request},
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

    def test_inactive_course_is_rejected(self):
        self.course.is_active = False
        self.course.save()

        serializer = StudentEnrolmentSerializer(
            data={"course": self.course.id},
            context={"request": self.request},
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "This course is no longer accepting enrolments",
            str(serializer.errors),
        )

    def test_create_uses_authenticated_user_as_student(self):
        serializer = StudentEnrolmentSerializer(
            data={"course": self.course.id},
            context={"request": self.request},
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

        enrolment = serializer.save()

        self.assertEqual(
            enrolment.student,
            self.student,
        )

        self.assertEqual(
            enrolment.course,
            self.course,
        )

#Issue-
#SubmitProgressSerializer seems to be nto used in current form
#So a potential removal later after full testing could happen
# class SubmitProgressSerializerTests(TestCase):

#     def test_progress_field_exists(self):
#         serializer = SubmitProgressSerializer()

#         self.assertIn(
#             "progress",
#             serializer.fields,
#         )

#     def test_progress_is_the_only_field(self):
#         serializer = SubmitProgressSerializer()

#         self.assertEqual(
#             set(serializer.fields.keys()),
#             {"progress"},
#         )


class GradeEnrolmentSerializerTests(TestCase):

    def test_grade_field_exists(self):
        serializer = GradeEnrolmentSerializer()

        self.assertIn(
            "grade",
            serializer.fields,
        )

    def test_grade_is_the_only_field(self):
        serializer = GradeEnrolmentSerializer()

        self.assertEqual(
            set(serializer.fields.keys()),
            {"grade"},
        )


class TeacherCourseProgressSerializerTests(
    SerializerTestMixin,
    TestCase,
):

    def setUp(self):
        self.teacher = self.create_user(
            "teacher",
            role="teacher",
        )

        self.student1 = self.create_user(
            "student1",
            role="student",
        )

        self.student2 = self.create_user(
            "student2",
            role="student",
        )

        self.course = self.create_course(
            teacher=self.teacher,
        )

        self.completed = Enrolment.objects.create(
            student=self.student1,
            course=self.course,
            status=Enrolment.Status.COMPLETED,
        )

        self.active = Enrolment.objects.create(
            student=self.student2,
            course=self.course,
            status=Enrolment.Status.ACTIVE,
        )

    def test_serializes_expected_fields(self):
        data = TeacherCourseProgressSerializer(
            self.course
        ).data

        self.assertEqual(
            set(data.keys()),
            {
                "id",
                "subject_name",
                "code",
                "completed_students",
            },
        )

    def test_only_completed_students_are_returned(self):
        data = TeacherCourseProgressSerializer(
            self.course
        ).data

        completed_students = data["completed_students"]

        self.assertEqual(
            len(completed_students),
            1,
        )

        self.assertEqual(
            completed_students[0]["student_name"],
            "student1",
        )


class CompletedEnrolmentSerializerTests(TestCase):

    def setUp(self):
        self.completed = CompletedEnrolment.objects.create(
            original_enrolment_id=1,
            student_id=2,
            student_username="student",
            student_first_name="Test",
            student_last_name="Student",
            teacher_id=3,
            teacher_username="teacher",
            teacher_first_name="Test",
            teacher_last_name="Teacher",
            course_id=4,
            course_name="Physics",
            course_code="PHY101",
            grade="A",
        )

    def test_serializes_all_expected_fields(self):
        data = CompletedEnrolmentSerializer(
            self.completed
        ).data

        expected_fields = {
            "id",
            "original_enrolment_id",
            "student_id",
            "student_username",
            "student_first_name",
            "student_last_name",
            "teacher_id",
            "teacher_username",
            "teacher_first_name",
            "teacher_last_name",
            "course_id",
            "course_name",
            "course_code",
            "grade",
            "completed_at",
        }

        self.assertEqual(
            set(data.keys()),
            expected_fields,
        )

    def test_all_fields_are_read_only(self):
        serializer = CompletedEnrolmentSerializer()

        for field_name in serializer.fields:
            self.assertTrue(
                serializer.fields[field_name].read_only,
                field_name,
            )


class TeacherDashboardSerializerTests(
    SerializerTestMixin,
    TestCase,
):

    def setUp(self):
        self.teacher = self.create_user(
            "teacher",
            role="teacher",
        )

        self.student1 = self.create_user(
            "student1",
            role="student",
        )

        self.student2 = self.create_user(
            "student2",
            role="student",
        )

        self.student3 = self.create_user(
            "student3",
            role="student",
        )

        self.student4 = self.create_user(
            "student4",
            role="student",
        )

        self.course = self.create_course(
            teacher=self.teacher,
        )

        Enrolment.objects.create(
            student=self.student1,
            course=self.course,
            status=Enrolment.Status.ACTIVE,
        )

        Enrolment.objects.create(
            student=self.student2,
            course=self.course,
            status=Enrolment.Status.COMPLETED,
        )

        Enrolment.objects.create(
            student=self.student3,
            course=self.course,
            status=Enrolment.Status.DROPPED,
        )

        Enrolment.objects.create(
            student=self.student4,
            course=self.course,
            status=Enrolment.Status.ACTIVE,
        )

    def test_student_counts_are_correct(self):
        data = TeacherDashboardSerializer(
            self.course
        ).data

        self.assertEqual(
            data["total_students"],
            4,
        )

        self.assertEqual(
            data["active_students"],
            2,
        )

        self.assertEqual(
            data["completed_students"],
            1,
        )

        self.assertEqual(
            data["dropped_students"],
            1,
        )


class TeacherCourseSerializerTests(
    TeacherDashboardSerializerTests
):

    def test_serializes_expected_fields(self):
        data = TeacherCourseSerializer(
            self.course
        ).data

        expected_fields = {
            "id",
            "subject_name",
            "code",
            "description",
            "is_active",
            "total_submissions",
            "created_at",
            "total_students",
            "active_students",
            "completed_students",
            "dropped_students",
        }

        self.assertEqual(
            set(data.keys()),
            expected_fields,
        )

    def test_student_counts_are_correct(self):
        data = TeacherCourseSerializer(
            self.course
        ).data

        self.assertEqual(
            data["total_students"],
            4,
        )

        self.assertEqual(
            data["active_students"],
            2,
        )

        self.assertEqual(
            data["completed_students"],
            1,
        )

        self.assertEqual(
            data["dropped_students"],
            1,
        )