from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Course, Enrolment


class CourseViewTestBase(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1",
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
            description="Other test course",
            total_submissions=4,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)


class CourseCreateViewTests(CourseViewTestBase):

    def test_unauthenticated_user_cannot_create_course(self):
        response = self.client.post(
            reverse("course-create"),
            {
                "subject_name": "Physics",
                "code": "PH101",
                "description": "Physics course",
                "total_submissions": 5,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_create_course(self):
        self.authenticate(self.student)

        response = self.client.post(
            reverse("course-create"),
            {
                "subject_name": "Physics",
                "code": "PH101",
                "description": "Physics course",
                "total_submissions": 5,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_create_course(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("course-create"),
            {
                "subject_name": "Physics",
                "code": "PH101",
                "description": "Physics course",
                "total_submissions": 5,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["subject_name"], "Physics")

    def test_teacher_is_automatically_assigned_as_course_teacher(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("course-create"),
            {
                "subject_name": "Physics",
                "code": "PH101",
                "description": "Physics course",
                "total_submissions": 5,
            },
        )

        course = Course.objects.get(pk=response.data["id"])

        self.assertEqual(course.teacher, self.teacher)

    def test_teacher_cannot_assign_course_to_another_teacher(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("course-create"),
            {
                "subject_name": "Physics",
                "code": "PH101",
                "description": "Physics course",
                "total_submissions": 5,
                "teacher": self.other_teacher.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        course = Course.objects.get(pk=response.data["id"])

        self.assertEqual(course.teacher, self.teacher)
        self.assertNotEqual(course.teacher, self.other_teacher)

    def test_admin_can_create_course(self):
        self.authenticate(self.admin)

        response = self.client.post(
            reverse("course-create"),
            {
                "subject_name": "Physics",
                "code": "PH101",
                "description": "Physics course",
                "total_submissions": 5,
                "teacher": self.other_teacher.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        course = Course.objects.get(pk=response.data["id"])

        self.assertEqual(course.teacher, self.other_teacher)

    def test_invalid_course_data_returns_bad_request(self):
        self.authenticate(self.teacher)

        response = self.client.post(
            reverse("course-create"),
            {
                "code": "PH101",
                "description": "Missing subject name",
                "total_submissions": 5,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CourseEditViewTests(CourseViewTestBase):

    def test_unauthenticated_user_cannot_edit_course(self):
        response = self.client.patch(
            reverse("course-update", args=[self.course.id]),
            {"description": "Updated"},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_edit_course(self):
        self.authenticate(self.student)

        response = self.client.patch(
            reverse("course-update", args=[self.course.id]),
            {"description": "Updated"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_edit_own_course(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse("course-update", args=[self.course.id]),
            {"description": "Updated description"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.course.refresh_from_db()

        self.assertEqual(
            self.course.description,
            "Updated description",
        )

    def test_teacher_cannot_edit_another_teachers_course(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse("course-update", args=[self.other_course.id]),
            {"description": "Unauthorised update"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_edit_any_course(self):
        self.authenticate(self.admin)

        response = self.client.patch(
            reverse("course-update", args=[self.course.id]),
            {"description": "Admin update"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.course.refresh_from_db()

        self.assertEqual(
            self.course.description,
            "Admin update",
        )

    def test_invalid_course_edit_returns_bad_request(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse("course-update", args=[self.course.id]),
            {"total_submissions": -1},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CourseListViewTests(CourseViewTestBase):

    def test_unauthenticated_user_cannot_list_courses(self):
        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_list_courses(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_teacher_can_list_courses(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_list_courses(self):
        self.authenticate(self.admin)

        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_course_list_contains_expected_fields(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course = response.data[0]

        expected_fields = {
            "id",
            "subject_name",
            "code",
            "is_active",
            "teacher_name",
            "total_submissions",
        }

        self.assertEqual(set(course.keys()), expected_fields)


class CourseDetailViewTests(CourseViewTestBase):

    def test_unauthenticated_user_cannot_view_course_detail(self):
        response = self.client.get(
            reverse("course-details", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_view_course_detail(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("course-details", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_course_detail_returns_requested_course(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("course-details", args=[self.course.id])
        )

        self.assertEqual(response.data["id"], self.course.id)
        self.assertEqual(
            response.data["subject_name"],
            self.course.subject_name,
        )

    def test_nonexistent_course_returns_not_found(self):
        self.authenticate(self.student)

        response = self.client.get(
            reverse("course-details", args=[99999])
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class AvailableCourseListViewTests(CourseViewTestBase):

    def setUp(self):
        super().setUp()

        self.inactive_course = Course.objects.create(
            subject_name="Inactive Course",
            code="IN101",
            teacher=self.teacher,
            total_submissions=3,
            is_active=False,
        )

    def test_unauthenticated_user_cannot_view_available_courses(self):
        response = self.client.get(reverse("available-courses"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_view_active_courses(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("available-courses"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course_ids = [course["id"] for course in response.data]

        self.assertIn(self.course.id, course_ids)
        self.assertNotIn(self.inactive_course.id, course_ids)

    def test_admin_can_view_active_courses(self):
        self.authenticate(self.admin)

        response = self.client.get(reverse("available-courses"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course_ids = [course["id"] for course in response.data]

        self.assertIn(self.course.id, course_ids)
        self.assertNotIn(self.inactive_course.id, course_ids)

    def test_teacher_sees_own_active_courses(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("available-courses"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course_ids = [course["id"] for course in response.data]

        self.assertIn(self.course.id, course_ids)
        self.assertNotIn(self.inactive_course.id, course_ids)

    def test_teacher_does_not_see_another_teachers_course(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("available-courses"))

        course_ids = [course["id"] for course in response.data]

        self.assertNotIn(self.other_course.id, course_ids)


class CourseFieldsViewTests(CourseViewTestBase):

    def test_unauthenticated_user_cannot_get_course_fields(self):
        response = self.client.get(reverse("course-fields"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_can_get_course_fields(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("course-fields"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn("role", response.data)
        self.assertIn("fields", response.data)
        self.assertIn("teacher_id", response.data)
        self.assertIn("teacher_options", response.data)

    def test_teacher_gets_own_teacher_id(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("course-fields"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["teacher_id"],
            self.teacher.id,
        )

    def test_teacher_does_not_get_teacher_options(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("course-fields"))

        self.assertEqual(response.data["teacher_options"], [])

    def test_admin_gets_teacher_options(self):
        self.authenticate(self.admin)

        response = self.client.get(reverse("course-fields"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        teacher_ids = [
            teacher["id"]
            for teacher in response.data["teacher_options"]
        ]

        self.assertIn(self.teacher.id, teacher_ids)
        self.assertIn(self.other_teacher.id, teacher_ids)

    def test_course_fields_have_expected_metadata(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("course-fields"))

        field_names = [
            field["name"]
            for field in response.data["fields"]
        ]

        self.assertEqual(
            field_names,
            [
                "subject_name",
                "code",
                "teacher",
                "description",
                "total_submissions",
            ],
        )

    def test_course_fields_have_expected_widgets(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("course-fields"))

        widgets = {
            field["name"]: field["widget"]
            for field in response.data["fields"]
        }

        self.assertEqual(widgets["subject_name"], "text")
        self.assertEqual(widgets["code"], "text")
        self.assertEqual(widgets["teacher"], "select")
        self.assertEqual(widgets["description"], "textarea")
        self.assertEqual(widgets["total_submissions"], "number")


class CourseToggleActiveViewTests(CourseViewTestBase):

    def test_unauthenticated_user_cannot_toggle_course(self):
        response = self.client.patch(
            reverse("course-toggle-active", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_toggle_course(self):
        self.authenticate(self.student)

        response = self.client.patch(
            reverse("course-toggle-active", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_toggle_own_course(self):
        self.authenticate(self.teacher)

        self.assertTrue(self.course.is_active)

        response = self.client.patch(
            reverse("course-toggle-active", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.course.refresh_from_db()

        self.assertFalse(self.course.is_active)

    def test_teacher_can_toggle_course_back_to_active(self):
        self.authenticate(self.teacher)

        self.course.is_active = False
        self.course.save()

        response = self.client.patch(
            reverse("course-toggle-active", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.course.refresh_from_db()

        self.assertTrue(self.course.is_active)

    def test_teacher_cannot_toggle_another_teachers_course(self):
        self.authenticate(self.teacher)

        response = self.client.patch(
            reverse("course-toggle-active", args=[self.other_course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_toggle_any_course(self):
        self.authenticate(self.admin)

        response = self.client.patch(
            reverse("course-toggle-active", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.course.refresh_from_db()

        self.assertFalse(self.course.is_active)


class CourseDeleteViewTests(CourseViewTestBase):

    def test_unauthenticated_user_cannot_delete_course(self):
        response = self.client.delete(
            reverse("delete-course", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_delete_course(self):
        self.authenticate(self.student)

        response = self.client.delete(
            reverse("delete-course", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_delete_course(self):
        self.authenticate(self.teacher)

        response = self.client.delete(
            reverse("delete-course", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_course_without_enrolments(self):
        self.authenticate(self.admin)

        course_id = self.course.id

        response = self.client.delete(
            reverse("delete-course", args=[course_id])
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(id=course_id).exists())

    def test_admin_cannot_delete_course_with_enrolments(self):
        self.authenticate(self.admin)

        Enrolment.objects.create(
            student=self.student,
            course=self.course,
        )

        response = self.client.delete(
            reverse("delete-course", args=[self.course.id])
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertTrue(
            Course.objects.filter(id=self.course.id).exists()
        )

    def test_nonexistent_course_returns_not_found(self):
        self.authenticate(self.admin)

        response = self.client.delete(
            reverse("delete-course", args=[99999])
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TeacherProgressViewTests(CourseViewTestBase):

    def test_teacher_can_view_their_course_progress(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.course.id)

    def test_teacher_only_sees_their_own_courses(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course_ids = [course["id"] for course in response.data]

        self.assertIn(self.course.id, course_ids)
        self.assertNotIn(self.other_course.id, course_ids)

    def test_course_with_no_enrolments_has_no_completed_students(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["completed_students"], [])

    def test_only_completed_enrolments_are_included(self):
        Enrolment.objects.create(
            student=self.student,
            course=self.course,
            status=Enrolment.Status.ACTIVE,
            completed_submissions=2,
        )

        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["completed_students"], [])

    def test_completed_enrolments_are_included(self):
        Enrolment.objects.create(
            student=self.student,
            course=self.course,
            status=Enrolment.Status.COMPLETED,
            completed_submissions=5,
            grade="A",
        )

        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        completed_students = response.data[0]["completed_students"]

        self.assertEqual(len(completed_students), 1)
        self.assertEqual(
            completed_students[0]["student_name"],
            self.student.username,
        )

    def test_student_cannot_view_teacher_progress(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_view_teacher_progress(self):
        self.authenticate(self.admin)

        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_view_teacher_progress(self):
        response = self.client.get(reverse("teacher-progress"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TeacherDashboardViewTests(CourseViewTestBase):

    def test_teacher_can_view_their_dashboard(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.course.id)

    def test_teacher_only_sees_their_own_courses(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course_ids = [course["id"] for course in response.data]

        self.assertIn(self.course.id, course_ids)
        self.assertNotIn(self.other_course.id, course_ids)

    def test_course_with_no_enrolments_has_zero_students(self):
        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course = response.data[0]

        self.assertEqual(course["total_students"], 0)
        self.assertEqual(course["active_students"], 0)
        self.assertEqual(course["completed_students"], 0)
        self.assertEqual(course["dropped_students"], 0)

    def test_dashboard_counts_enrolments_by_status(self):
        Enrolment.objects.create(
            student=self.student,
            course=self.course,
            status=Enrolment.Status.ACTIVE,
        )

        another_student = User.objects.create_user(
            username="student2",
            password="password123",
            role="student",
        )

        Enrolment.objects.create(
            student=another_student,
            course=self.course,
            status=Enrolment.Status.COMPLETED,
            completed_submissions=5,
            grade="A",
        )

        third_student = User.objects.create_user(
            username="student3",
            password="password123",
            role="student",
        )

        Enrolment.objects.create(
            student=third_student,
            course=self.course,
            status=Enrolment.Status.DROPPED,
        )

        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        course = response.data[0]

        self.assertEqual(course["total_students"], 3)
        self.assertEqual(course["active_students"], 1)
        self.assertEqual(course["completed_students"], 1)
        self.assertEqual(course["dropped_students"], 1)

    def test_inactive_course_still_appears_on_teacher_dashboard(self):
        self.course.is_active = False
        self.course.save()

        self.authenticate(self.teacher)

        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.course.id)
        self.assertFalse(response.data[0]["is_active"])

    def test_student_cannot_view_teacher_dashboard(self):
        self.authenticate(self.student)

        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_view_teacher_dashboard(self):
        self.authenticate(self.admin)

        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_view_teacher_dashboard(self):
        response = self.client.get(reverse("teacher-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)