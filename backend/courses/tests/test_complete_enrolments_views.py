from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from courses.models import Course, Enrolment, CompletedEnrolment


class CompletionTestSetup(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.student = User.objects.create_user(
            username="student1",
            password="password123",
            role="student",
            first_name="Student",
            last_name="One",
        )

        self.other_student = User.objects.create_user(
            username="student2",
            password="password123",
            role="student",
            first_name="Student",
            last_name="Two",
        )

        self.teacher = User.objects.create_user(
            username="teacher1",
            password="password123",
            role="teacher",
            first_name="Teacher",
            last_name="One",
        )

        self.other_teacher = User.objects.create_user(
            username="teacher2",
            password="password123",
            role="teacher",
            first_name="Teacher",
            last_name="Two",
        )

        self.admin = User.objects.create_superuser(
            username="admin",
            password="password123",
            role="admin",
        )

        self.course = Course.objects.create(
            subject_name="Mathematics",
            code="MATH101",
            teacher=self.teacher,
            total_submissions=3,
        )

        self.other_course = Course.objects.create(
            subject_name="History",
            code="HIST101",
            teacher=self.other_teacher,
            total_submissions=2,
        )

        self.enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course,
            completed_submissions=3,
            status=Enrolment.Status.COMPLETED,
            grade="A",
            student_completed=True,
        )

        self.other_enrolment = Enrolment.objects.create(
            student=self.other_student,
            course=self.other_course,
            completed_submissions=2,
            status=Enrolment.Status.COMPLETED,
            grade="B",
            student_completed=True,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)


class AcknowledgeCompletionViewTests(CompletionTestSetup):

    def test_student_can_acknowledge_completed_enrolment(self):
        self.enrolment.student_completed = False
        self.enrolment.save()

        self.authenticate(self.student)

        response = self.client.patch(
            reverse(
                "acknowledge-completion",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.enrolment.refresh_from_db()

        self.assertTrue(
            self.enrolment.student_completed
        )

    def test_acknowledgement_requires_all_submissions_complete(self):
        self.enrolment.completed_submissions = 2
        self.enrolment.student_completed = False
        self.enrolment.save()

        self.authenticate(self.student)

        response = self.client.patch(
            reverse(
                "acknowledge-completion",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.enrolment.refresh_from_db()

        self.assertFalse(
            self.enrolment.student_completed
        )

    def test_acknowledgement_requires_grade(self):
        self.enrolment.grade = ""
        self.enrolment.student_completed = False
        self.enrolment.save()

        self.authenticate(self.student)

        response = self.client.patch(
            reverse(
                "acknowledge-completion",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.enrolment.refresh_from_db()

        self.assertFalse(
            self.enrolment.student_completed
        )

    def test_student_cannot_acknowledge_another_students_enrolment(self):
        self.authenticate(self.student)

        response = self.client.patch(
            reverse(
                "acknowledge-completion",
                kwargs={"pk": self.other_enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_teacher_cannot_acknowledge_completion(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse(
                "acknowledge-completion",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_cannot_acknowledge_completion(self):
        self.authenticate(self.admin)

        response = self.client.patch(
            reverse(
                "acknowledge-completion",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_acknowledge_completion(self):
        response = self.client.patch(
            reverse(
                "acknowledge-completion",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


class CompleteEnrolmentViewTests(CompletionTestSetup):

    def test_student_can_archive_eligible_enrolment(self):
        self.authenticate(self.student)

        enrolment_id = self.enrolment.id

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": enrolment_id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            CompletedEnrolment.objects.filter(
                original_enrolment_id=enrolment_id
            ).exists()
        )

        self.assertFalse(
            Enrolment.objects.filter(
                id=enrolment_id
            ).exists()
        )

    def test_archived_enrolment_contains_correct_snapshot(self):
        self.authenticate(self.student)

        enrolment_id = self.enrolment.id

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": enrolment_id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        completed = CompletedEnrolment.objects.get(
            original_enrolment_id=enrolment_id
        )

        self.assertEqual(
            completed.student_id,
            self.student.id,
        )
        self.assertEqual(
            completed.student_username,
            self.student.username,
        )
        self.assertEqual(
            completed.student_first_name,
            self.student.first_name,
        )
        self.assertEqual(
            completed.student_last_name,
            self.student.last_name,
        )

        self.assertEqual(
            completed.teacher_id,
            self.teacher.id,
        )
        self.assertEqual(
            completed.teacher_username,
            self.teacher.username,
        )
        self.assertEqual(
            completed.teacher_first_name,
            self.teacher.first_name,
        )
        self.assertEqual(
            completed.teacher_last_name,
            self.teacher.last_name,
        )

        self.assertEqual(
            completed.course_id,
            self.course.id,
        )
        self.assertEqual(
            completed.course_name,
            self.course.subject_name,
        )
        self.assertEqual(
            completed.course_code,
            self.course.code,
        )

        self.assertEqual(
            completed.grade,
            "A",
        )

    def test_cannot_archive_before_all_submissions_are_complete(self):
        self.enrolment.completed_submissions = 2
        self.enrolment.save()

        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            CompletedEnrolment.objects.filter(
                original_enrolment_id=self.enrolment.id
            ).exists()
        )

        self.assertTrue(
            Enrolment.objects.filter(
                id=self.enrolment.id
            ).exists()
        )

    def test_cannot_archive_without_grade(self):
        self.enrolment.grade = ""
        self.enrolment.save()

        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            CompletedEnrolment.objects.filter(
                original_enrolment_id=self.enrolment.id
            ).exists()
        )

    def test_cannot_archive_without_student_acknowledgement(self):
        self.enrolment.student_completed = False
        self.enrolment.save()

        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            CompletedEnrolment.objects.filter(
                original_enrolment_id=self.enrolment.id
            ).exists()
        )

    def test_student_cannot_archive_another_students_enrolment(self):
        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.other_enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_teacher_cannot_archive_enrolment(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_cannot_archive_enrolment(self):
        self.authenticate(self.admin)

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_archive_enrolment(self):
        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_cannot_archive_already_archived_enrolment(self):
        CompletedEnrolment.objects.create(
            original_enrolment_id=self.enrolment.id,
            student_id=self.student.id,
            student_username=self.student.username,
            student_first_name=self.student.first_name,
            student_last_name=self.student.last_name,
            teacher_id=self.teacher.id,
            teacher_username=self.teacher.username,
            teacher_first_name=self.teacher.first_name,
            teacher_last_name=self.teacher.last_name,
            course_id=self.course.id,
            course_name=self.course.subject_name,
            course_code=self.course.code,
            grade="A",
        )

        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "complete-enrolment",
                kwargs={"pk": self.enrolment.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


class CompleteEnrolmentHistoryViewTests(CompletionTestSetup):

    def test_admin_can_view_completion_history(self):
        self.authenticate(self.admin)

        CompletedEnrolment.objects.create(
            original_enrolment_id=100,
            student_id=self.student.id,
            student_username=self.student.username,
            student_first_name=self.student.first_name,
            student_last_name=self.student.last_name,
            teacher_id=self.teacher.id,
            teacher_username=self.teacher.username,
            teacher_first_name=self.teacher.first_name,
            teacher_last_name=self.teacher.last_name,
            course_id=self.course.id,
            course_name=self.course.subject_name,
            course_code=self.course.code,
            grade="A",
        )

        response = self.client.get(
            reverse("complete-enrolment-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_teacher_can_view_completion_history(self):
        self.authenticate(self.teacher)

        CompletedEnrolment.objects.create(
            original_enrolment_id=100,
            student_id=self.student.id,
            student_username=self.student.username,
            student_first_name=self.student.first_name,
            student_last_name=self.student.last_name,
            teacher_id=self.teacher.id,
            teacher_username=self.teacher.username,
            teacher_first_name=self.teacher.first_name,
            teacher_last_name=self.teacher.last_name,
            course_id=self.course.id,
            course_name=self.course.subject_name,
            course_code=self.course.code,
            grade="A",
        )

        response = self.client.get(
            reverse("complete-enrolment-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_teacher_only_sees_their_own_course_completions(self):
        CompletedEnrolment.objects.create(
            original_enrolment_id=100,
            student_id=self.student.id,
            student_username=self.student.username,
            student_first_name=self.student.first_name,
            student_last_name=self.student.last_name,
            teacher_id=self.teacher.id,
            teacher_username=self.teacher.username,
            teacher_first_name=self.teacher.first_name,
            teacher_last_name=self.teacher.last_name,
            course_id=self.course.id,
            course_name=self.course.subject_name,
            course_code=self.course.code,
            grade="A",
        )

        CompletedEnrolment.objects.create(
            original_enrolment_id=101,
            student_id=self.other_student.id,
            student_username=self.other_student.username,
            student_first_name=self.other_student.first_name,
            student_last_name=self.other_student.last_name,
            teacher_id=self.other_teacher.id,
            teacher_username=self.other_teacher.username,
            teacher_first_name=self.other_teacher.first_name,
            teacher_last_name=self.other_teacher.last_name,
            course_id=self.other_course.id,
            course_name=self.other_course.subject_name,
            course_code=self.other_course.code,
            grade="B",
        )

        self.authenticate(self.teacher)

        response = self.client.get(
            reverse("complete-enrolment-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["teacher_username"],
            self.teacher.username,
        )

    def test_student_cannot_view_completion_history(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("complete-enrolment-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_view_completion_history(self):
        response = self.client.get(
            reverse("complete-enrolment-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_empty_completion_history_returns_empty_list(self):
        CompletedEnrolment.objects.all().delete()

        self.authenticate(self.admin)

        response = self.client.get(
            reverse("complete-enrolment-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data,
            [],
        )


class MyCompletedEnrolmentsViewTests(CompletionTestSetup):

    def test_student_can_view_completed_enrolments(self):
        completed = CompletedEnrolment.objects.create(
            original_enrolment_id=100,
            student_id=self.student.id,
            student_username=self.student.username,
            student_first_name=self.student.first_name,
            student_last_name=self.student.last_name,
            teacher_id=self.teacher.id,
            teacher_username=self.teacher.username,
            teacher_first_name=self.teacher.first_name,
            teacher_last_name=self.teacher.last_name,
            course_id=self.course.id,
            course_name=self.course.subject_name,
            course_code=self.course.code,
            grade="A",
        )

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-completed-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            completed.id,
        )

    def test_student_only_sees_their_own_completed_enrolments(self):
        CompletedEnrolment.objects.create(
            original_enrolment_id=100,
            student_id=self.student.id,
            student_username=self.student.username,
            student_first_name=self.student.first_name,
            student_last_name=self.student.last_name,
            teacher_id=self.teacher.id,
            teacher_username=self.teacher.username,
            teacher_first_name=self.teacher.first_name,
            teacher_last_name=self.teacher.last_name,
            course_id=self.course.id,
            course_name=self.course.subject_name,
            course_code=self.course.code,
            grade="A",
        )

        CompletedEnrolment.objects.create(
            original_enrolment_id=101,
            student_id=self.other_student.id,
            student_username=self.other_student.username,
            student_first_name=self.other_student.first_name,
            student_last_name=self.other_student.last_name,
            teacher_id=self.other_teacher.id,
            teacher_username=self.other_teacher.username,
            teacher_first_name=self.other_teacher.first_name,
            teacher_last_name=self.other_teacher.last_name,
            course_id=self.other_course.id,
            course_name=self.other_course.subject_name,
            course_code=self.other_course.code,
            grade="B",
        )

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-completed-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["student_username"],
            self.student.username,
        )

    def test_student_with_no_history_gets_empty_list(self):
        CompletedEnrolment.objects.all().delete()

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-completed-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data,
            [],
        )

    def test_teacher_cannot_view_student_completion_history(self):
        self.authenticate(self.teacher)

        response = self.client.get(
            reverse("my-completed-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_cannot_view_student_completion_history(self):
        self.authenticate(self.admin)

        response = self.client.get(
            reverse("my-completed-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_view_student_completion_history(self):
        response = self.client.get(
            reverse("my-completed-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


class StudentGradeViewTests(CompletionTestSetup):
###dd
    def test_student_can_view_their_grades(self):
        # enrolment = Enrolment.objects.create(
        #     student=self.student,
        #     course=self.course,
        #     completed_submissions=3,
        #     status=Enrolment.Status.COMPLETED,
        #     grade="A",
        #     student_completed=True,
        # )

        # self.authenticate(self.student)

        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["grade"],
            "A",
        )

    def test_student_only_sees_completed_enrolments(self):
        Enrolment.objects.create(
            student=self.student,
            course=self.other_course,
            completed_submissions=1,
            status=Enrolment.Status.ACTIVE,
            grade="B",
        )

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["grade"],
            "A",
        )

    def test_ungraded_completed_enrolments_are_excluded(self):
        Enrolment.objects.create(
            student=self.student,
            course=self.other_course,
            completed_submissions=2,
            status=Enrolment.Status.COMPLETED,
            grade="",
        )

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["grade"],
            "A",
        )

    def test_student_does_not_see_another_students_grades(self):
        # Enrolment.objects.create(
        #     student=self.other_student,
        #     course=self.other_course,
        #     completed_submissions=2,
        #     status=Enrolment.Status.COMPLETED,
        #     grade="B",
        # )

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["student_name"],
            self.student.username,
        )

    def test_teacher_cannot_view_student_grades(self):
        self.authenticate(self.teacher)

        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_cannot_view_student_grades(self):
        self.authenticate(self.admin)

        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,   
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_cannot_view_student_grades(self):
        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )