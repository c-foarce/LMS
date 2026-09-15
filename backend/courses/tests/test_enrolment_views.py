from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Course, Enrolment


class EnrolmentViewTestBase(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1",
            password="password123",
            role="student",
        )

        self.other_student = User.objects.create_user(
            username="student2",
            password="password123",
            role="student",
        )

        self.teacher = User.objects.create_user(
            username="teacher1",
            password="password123",
            role="teacher",
        )

        self.other_teacher = User.objects.create_user(
            username="teacher2",
            password="password123",
            role="teacher",
        )

        self.admin = User.objects.create_superuser(
            username="admin1",
            password="password123",
            role="admin",
        )

        self.course = Course.objects.create(
            subject_name="Computer Science",
            code="CS101",
            teacher=self.teacher,
            description="Test course",
            total_submissions=5,
        )

        self.other_course = Course.objects.create(
            subject_name="Mathematics",
            code="MA101",
            teacher=self.other_teacher,
            description="Other course",
            total_submissions=4,
        )

        self.enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.course,
        )

        self.other_enrolment = Enrolment.objects.create(
            student=self.other_student,
            course=self.other_course,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)


# -------------------------------------------------------------------
# MyEnrolmentsView
# -------------------------------------------------------------------

class MyEnrolmentsViewTests(EnrolmentViewTestBase):

    def test_unauthenticated_user_cannot_view_enrolments(self):
        response = self.client.get(
            reverse("my-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_can_view_own_enrolments(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        enrolment_ids = [
            enrolment["id"]
            for enrolment in response.data
        ]

        self.assertIn(self.enrolment.id, enrolment_ids)

    def test_student_only_sees_own_enrolments(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-enrolments")
        )

        enrolment_ids = [
            enrolment["id"]
            for enrolment in response.data
        ]

        self.assertIn(self.enrolment.id, enrolment_ids)
        self.assertNotIn(self.other_enrolment.id, enrolment_ids)

    def test_authenticated_user_with_no_enrolments_gets_empty_list(self):
        self.enrolment.delete()

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(response.data, [])

    def test_my_enrolments_return_expected_fields(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-enrolments")
        )

        enrolment = response.data[0]

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

        self.assertEqual(
            set(enrolment.keys()),
            expected_fields,
        )


# -------------------------------------------------------------------
# EnrolmentCreateView
# -------------------------------------------------------------------

class EnrolmentCreateViewTests(EnrolmentViewTestBase):

    def test_unauthenticated_user_cannot_create_enrolment(self):
        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.student.id,
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_cannot_create_enrolment_for_student(self):
        self.authenticate(self.student)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.other_student.id,
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_teacher_can_create_enrolment_on_own_course(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.other_student.id,
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_teacher_cannot_create_enrolment_on_other_teachers_course(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.student.id,
                "course": self.other_course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_admin_can_create_enrolment_on_any_course(self):
        self.authenticate(self.admin)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.student.id,
                "course": self.other_course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_cannot_create_enrolment_on_inactive_course(self):
        self.course.is_active = False
        self.course.save()

        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.other_student.id,
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_duplicate_enrolment_is_rejected(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.student.id,
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_missing_student_returns_bad_request(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_missing_course_returns_bad_request(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.student.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_created_enrolment_has_correct_student_and_course(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-admin"),
            {
                "student": self.other_student.id,
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        enrolment = Enrolment.objects.get(
            student=self.other_student,
            course = self.course
        )

        self.assertEqual(
            enrolment.student,
            self.other_student,
        )
        self.assertEqual(
            enrolment.course,
            self.course,
        )


# -------------------------------------------------------------------
# StudentEnrolmentCreateView
# -------------------------------------------------------------------

class StudentEnrolmentCreateViewTests(EnrolmentViewTestBase):

    def test_unauthenticated_user_cannot_self_enrol(self):
        response = self.client.post(
            reverse("enrolment-create-student"),
            {
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_can_enrol_themselves(self):
        self.enrolment.delete()

        self.authenticate(self.student)

        response = self.client.post(
            reverse("enrolment-create-student"),
            {
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_created_enrolment_belongs_to_requesting_student(self):
        self.enrolment.delete()

        self.authenticate(self.student)

        response = self.client.post(
            reverse("enrolment-create-student"),
            {
                "course": self.course.id,
            },
        )

        enrolment = Enrolment.objects.get(
            student=self.student,
            course=self.course
        )

        self.assertEqual(
            enrolment.student,
            self.student,
        )

    def test_student_cannot_enrol_on_inactive_course(self):
        self.enrolment.delete()

        self.course.is_active = False
        self.course.save()

        self.authenticate(self.student)

        response = self.client.post(
            reverse("enrolment-create-student"),
            {
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_student_cannot_duplicate_enrolment(self):
        self.authenticate(self.student)

        response = self.client.post(
            reverse("enrolment-create-student"),
            {
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_teacher_cannot_use_student_enrolment_endpoint(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("enrolment-create-student"),
            {
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_cannot_use_student_enrolment_endpoint(self):
        self.authenticate(self.admin)

        response = self.client.post(
            reverse("enrolment-create-student"),
            {
                "course": self.course.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )


# -------------------------------------------------------------------
# EnrolmentDeleteView
# -------------------------------------------------------------------

class EnrolmentDeleteViewTests(EnrolmentViewTestBase):

    def test_unauthenticated_user_cannot_delete_enrolment(self):
        response = self.client.delete(
            reverse(
                "delete-enrolment",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_cannot_delete_enrolment(self):
        self.authenticate(self.student)

        response = self.client.delete(
            reverse(
                "delete-enrolment",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_teacher_can_delete_enrolment(self):
        self.authenticate(self.teacher)

        response = self.client.delete(
            reverse(
                "delete-enrolment",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Enrolment.objects.filter(
                id=self.enrolment.id
            ).exists()
        )

    def test_admin_can_delete_enrolment(self):
        self.authenticate(self.admin)

        response = self.client.delete(
            reverse(
                "delete-enrolment",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

    #this needs to be fixe,d test is here to check the "wrong" thing DOES happen, then we can fix
    def test_teacher_can_delete_enrolment_from_another_teachers_course(self):
        self.authenticate(self.teacher)

        response = self.client.delete(
            reverse(
                "delete-enrolment",
                args=[self.other_enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

    def test_nonexistent_enrolment_returns_not_found(self):
        self.authenticate(self.admin)

        response = self.client.delete(
            reverse(
                "delete-enrolment",
                args=[99999],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# -------------------------------------------------------------------
# ListAllEnrolmentsView
# -------------------------------------------------------------------

class ListAllEnrolmentsViewTests(EnrolmentViewTestBase):

    def test_unauthenticated_user_cannot_list_all_enrolments(self):
        response = self.client.get(
            reverse("all-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_cannot_list_all_enrolments(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("all-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_teacher_cannot_list_all_enrolments(self):
        self.authenticate(self.teacher)

        response = self.client.get(
            reverse("all-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_can_list_all_enrolments(self):
        self.authenticate(self.admin)

        response = self.client.get(
            reverse("all-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_admin_sees_all_enrolments(self):
        self.authenticate(self.admin)

        response = self.client.get(
            reverse("all-enrolments")
        )

        enrolment_ids = [
            enrolment["id"]
            for enrolment in response.data
        ]

        self.assertIn(
            self.enrolment.id,
            enrolment_ids,
        )
        self.assertIn(
            self.other_enrolment.id,
            enrolment_ids,
        )

    def test_empty_enrolment_list_returns_empty_list(self):
        Enrolment.objects.all().delete()

        self.authenticate(self.admin)

        response = self.client.get(
            reverse("all-enrolments")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(response.data, [])


# -------------------------------------------------------------------
# SubmitProgress
# -------------------------------------------------------------------

class SubmitProgressTests(EnrolmentViewTestBase):

    def test_unauthenticated_user_cannot_submit_progress(self):
        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_can_submit_progress(self):
        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.enrolment.refresh_from_db()

        self.assertEqual(
            self.enrolment.completed_submissions,
            1,
        )

    def test_progress_increments_correctly(self):
        self.authenticate(self.student)

        self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.enrolment.refresh_from_db()

        self.assertEqual(
            self.enrolment.completed_submissions,
            2,
        )

    def test_student_cannot_submit_progress_for_another_student(self):
        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.other_enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_reaching_required_submissions_marks_enrolment_completed(self):
        self.course.total_submissions = 2
        self.course.save()

        self.authenticate(self.student)

        self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.enrolment.refresh_from_db()

        self.assertEqual(
            self.enrolment.completed_submissions,
            2,
        )
        self.assertEqual(
            self.enrolment.status,
            Enrolment.Status.COMPLETED,
        )

    def test_cannot_submit_progress_beyond_required_amount(self):
        self.course.total_submissions = 1
        self.course.save()

        self.enrolment.completed_submissions = 1
        self.enrolment.status = Enrolment.Status.COMPLETED
        self.enrolment.save()

        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.enrolment.refresh_from_db()

        self.assertEqual(
            self.enrolment.completed_submissions,
            1,
        )

    def test_submit_progress_returns_updated_enrolment(self):
        self.authenticate(self.student)

        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )
##??
        self.assertEqual(
            response.data["id"],
            self.enrolment.id,
        )
        self.assertEqual(
            response.data["completed_submissions"],
            1,
        )
        self.assertEqual(
            response.data["progress"],
            20,
        )

    def test_teacher_cannot_submit_student_progress(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_admin_cannot_submit_student_progress(self):
        self.authenticate(self.admin)

        response = self.client.post(
            reverse(
                "submit-progress",
                args=[self.enrolment.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )


# -------------------------------------------------------------------
# GradeEnrolmentView
# -------------------------------------------------------------------

class GradeEnrolmentViewTests(EnrolmentViewTestBase):

    def test_unauthenticated_user_cannot_grade_enrolment(self):
        response = self.client.patch(
            reverse(
                "grade-enrolment",
                args=[self.enrolment.id],
            ),
            {"grade": "A"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_cannot_grade_enrolment(self):
        self.authenticate(self.student)

        response = self.client.patch(
            reverse(
                "grade-enrolment",
                args=[self.enrolment.id],
            ),
            {"grade": "A"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_cannot_grade_enrolment(self):
        self.authenticate(self.admin)

        response = self.client.patch(
            reverse(
                "grade-enrolment",
                args=[self.enrolment.id],
            ),
            {"grade": "A"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_teacher_can_grade_own_course_enrolment(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse(
                "grade-enrolment",
                args=[self.enrolment.id],
            ),
            {"grade": "A"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_teacher_cannot_grade_another_teachers_enrolment(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse(
                "grade-enrolment",
                args=[self.other_enrolment.id],
            ),
            {"grade": "A"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_grade_is_persisted(self):
        self.authenticate(self.teacher)

        self.client.patch(
            reverse(
                "grade-enrolment",
                args=[self.enrolment.id],
            ),
            {"grade": "A"},
        )

        self.enrolment.refresh_from_db()

        self.assertEqual(
            self.enrolment.grade,
            "A",
        )

    def test_invalid_grade_returns_bad_request(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse(
                "grade-enrolment",
                args=[self.enrolment.id],
            ),
            {"grade": "INVALID"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


# -------------------------------------------------------------------
# StudentGradeView
# -------------------------------------------------------------------

class StudentGradeViewTests(EnrolmentViewTestBase):

    def setUp(self):
        super().setUp()

        self.graded_enrolment = Enrolment.objects.create(
            student=self.student,
            course=self.other_course,
            status=Enrolment.Status.COMPLETED,
            grade="A",
            completed_submissions=self.other_course.total_submissions,
        )

        self.ungraded_completed_enrolment = Enrolment.objects.create(
            student=self.student,
            course=Course.objects.create(
                subject_name="Physics",
                code="PH101",
                teacher=self.teacher,
                total_submissions=3,
            ),
            status=Enrolment.Status.COMPLETED,
            grade="",
            completed_submissions=3,
        )

        self.incomplete_graded_enrolment = Enrolment.objects.create(
            student=self.student,
            course=Course.objects.create(
                subject_name="Chemistry",
                code="CH101",
                teacher=self.teacher,
                total_submissions=3,
            ),
            status=Enrolment.Status.ACTIVE,
            grade="B",
            completed_submissions=1,
        )

    def test_unauthenticated_user_cannot_view_grades(self):
        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_can_view_grades(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_only_own_grades_are_returned(self):
        other_student_course = Course.objects.create(
            subject_name="Biology",
            code="BI101",
            teacher=self.teacher,
            total_submissions=2,
        )

        other_student_graded = Enrolment.objects.create(
            student=self.other_student,
            course=other_student_course,
            status=Enrolment.Status.COMPLETED,
            grade="A",
            completed_submissions=2,
        )

        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        returned_ids = [
            enrolment["id"]
            for enrolment in response.data
        ]

        self.assertIn(
            self.graded_enrolment.id,
            returned_ids,
        )
        self.assertNotIn(
            other_student_graded.id,
            returned_ids,
        )

    def test_incomplete_enrolments_are_excluded(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        returned_ids = [
            enrolment["id"]
            for enrolment in response.data
        ]

        self.assertNotIn(
            self.incomplete_graded_enrolment.id,
            returned_ids,
        )

    def test_completed_but_ungraded_enrolments_are_excluded(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        returned_ids = [
            enrolment["id"]
            for enrolment in response.data
        ]

        self.assertNotIn(
            self.ungraded_completed_enrolment.id,
            returned_ids,
        )

    def test_completed_and_graded_enrolments_are_returned(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("my-grades")
        )

        returned_ids = [
            enrolment["id"]
            for enrolment in response.data
        ]

        self.assertIn(
            self.graded_enrolment.id,
            returned_ids,
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