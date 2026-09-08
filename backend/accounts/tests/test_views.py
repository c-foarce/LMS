from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User


class RegistrationViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/accounts/register/"

    def test_register_student_successfully(self):
        response = self.client.post(
            self.url,
            {
                "username": "student",
                "password": "password123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="student")

        self.assertEqual(user.role, "student")
        self.assertTrue(user.check_password("password123"))

    def test_register_teacher_successfully(self):
        response = self.client.post(
            self.url,
            {
                "username": "teacher",
                "password": "password123",
                "role": "teacher",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="teacher")

        self.assertEqual(user.role, "teacher")
        self.assertTrue(user.check_password("password123"))

    def test_register_admin_successfully(self):
        response = self.client.post(
            self.url,
            {
                "username": "admin",
                "password": "password123",
                "role": "admin",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="admin")

        self.assertEqual(user.role, "admin")
        self.assertTrue(user.check_password("password123"))

    def test_register_without_role_defaults_to_student(self):
        response = self.client.post(
            self.url,
            {
                "username": "student",
                "password": "password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="student")

        self.assertEqual(user.role, User.Roles.STUDENT)

    def test_register_without_username_returns_bad_request(self):
        response = self.client.post(
            self.url,
            {
                "password": "password123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_without_password_returns_bad_request(self):
        response = self.client.post(
            self.url,
            {
                "username": "student",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username_returns_bad_request(self):
        User.objects.create_user(
            username="student",
            password="password123"
        )

        response = self.client.post(
            self.url,
            {
                "username": "student",
                "password": "differentpassword",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_role_returns_bad_request(self):
        response = self.client.post(
            self.url,
            {
                "username": "student",
                "password": "password123",
                "role": "invalid",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_does_not_return_password(self):
        response = self.client.post(
            self.url,
            {
                "username": "student",
                "password": "password123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", response.data)


class LoginViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/accounts/login/"

        self.user = User.objects.create_user(
            username="alice",
            password="password123",
            role="student"
        )

    def test_valid_credentials_return_tokens(self):
        response = self.client.post(
            self.url,
            {
                "username": "alice",
                "password": "password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_incorrect_password_returns_unauthorized(self):
        response = self.client.post(
            self.url,
            {
                "username": "alice",
                "password": "wrongpassword",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unknown_username_returns_unauthorized(self):
        response = self.client.post(
            self.url,
            {
                "username": "doesnotexist",
                "password": "password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_password_returns_bad_request(self):
        response = self.client.post(
            self.url,
            {
                "username": "alice",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_username_returns_bad_request(self):
        response = self.client.post(
            self.url,
            {
                "password": "password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RefreshTokenViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.login_url = "/api/accounts/login/"
        self.refresh_url = "/api/accounts/refresh/"

        User.objects.create_user(
            username="alice",
            password="password123",
            role="student"
        )

    def test_valid_refresh_token_returns_new_access_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "username": "alice",
                "password": "password123",
            },
            format="json",
        )

        refresh_token = login_response.data["refresh"]

        response = self.client.post(
            self.refresh_url,
            {
                "refresh": refresh_token,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_invalid_refresh_token_returns_unauthorized(self):
        response = self.client.post(
            self.refresh_url,
            {
                "refresh": "invalid-token",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_refresh_token_returns_bad_request(self):
        response = self.client.post(
            self.refresh_url,
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserRoleViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/accounts/user-role/"

    def test_student_receives_correct_user_information(self):
        user = User.objects.create_user(
            username="student",
            password="password123",
            role="student"
        )

        self.client.force_authenticate(user=user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], user.id)
        self.assertEqual(response.data["username"], "student")
        self.assertEqual(response.data["role"], "student")

    def test_teacher_receives_correct_user_information(self):
        user = User.objects.create_user(
            username="teacher",
            password="password123",
            role="teacher"
        )

        self.client.force_authenticate(user=user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], user.id)
        self.assertEqual(response.data["username"], "teacher")
        self.assertEqual(response.data["role"], "teacher")

    def test_admin_receives_correct_user_information(self):
        user = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

        self.client.force_authenticate(user=user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], user.id)
        self.assertEqual(response.data["username"], "admin")
        self.assertEqual(response.data["role"], "admin")

    def test_unauthenticated_user_is_rejected(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_is_not_exposed(self):
        user = User.objects.create_user(
            username="student",
            password="password123",
            role="student"
        )

        self.client.force_authenticate(user=user)

        response = self.client.get(self.url)

        self.assertNotIn("password", response.data)

    def test_only_expected_fields_are_returned(self):
        user = User.objects.create_user(
            username="student",
            password="password123",
            role="student"
        )

        self.client.force_authenticate(user=user)

        response = self.client.get(self.url)

        self.assertEqual(
            set(response.data.keys()),
            {"id", "username", "role"}
        )


class UserFieldsViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/accounts/user-fields/"

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

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

    def test_admin_can_retrieve_user_fields(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("fields", response.data)

    def test_expected_fields_are_returned(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        field_names = [
            field["name"]
            for field in response.data["fields"]
        ]

        expected_fields = [
            "first_name",
            "last_name",
            "username",
            "password",
            "email",
            "role",
        ]

        self.assertEqual(field_names, expected_fields)

    def test_field_metadata_contains_name_type_and_required(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        for field in response.data["fields"]:
            self.assertIn("name", field)
            self.assertIn("type", field)
            self.assertIn("required", field)

    def test_role_field_contains_expected_choices(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        role_field = next(
            field
            for field in response.data["fields"]
            if field["name"] == "role"
        )

        choices = role_field["choices"]

        self.assertEqual(
            choices,
            [
                {"value": "student", "label": "Student"},
                {"value": "teacher", "label": "Teacher"},
                {"value": "admin", "label": "Admin"},
            ]
        )

    def test_student_cannot_access_user_fields(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_access_user_fields(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_access_user_fields(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class StudentListViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/accounts/students/"

        self.student = User.objects.create_user(
            username="student",
            password="password123",
            role="student"
        )

        self.teacher = User.objects.create_user(
            username="teacher",
            password="password123",
            role="teacher"
        )

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

    def test_returns_students(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertIn("student", usernames)

    def test_excludes_teachers(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertNotIn("teacher", usernames)

    def test_excludes_admins(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertNotIn("admin", usernames)

    def test_returns_only_id_and_username(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        for user in response.data:
            self.assertEqual(
                set(user.keys()),
                {"id", "username"}
            )

    def test_empty_student_list_returns_empty_list(self):
        self.student.delete()

        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_student_can_access_student_list(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_teacher_can_access_student_list(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_access_student_list(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_user_is_rejected(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AllUserListViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/accounts/all/"

        self.student = User.objects.create_user(
            username="student",
            password="password123",
            role="student"
        )

        self.teacher = User.objects.create_user(
            username="teacher",
            password="password123",
            role="teacher"
        )

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

    def test_admin_receives_all_users(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertIn("student", usernames)
        self.assertIn("teacher", usernames)
        self.assertIn("admin", usernames)

    def test_student_is_included(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertIn("student", usernames)

    def test_teacher_is_included(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertIn("teacher", usernames)

    def test_admin_is_included(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertIn("admin", usernames)

    def test_passwords_are_not_exposed(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        for user in response.data:
            self.assertNotIn("password", user)

    def test_empty_user_list_returns_empty_list(self):
        User.objects.all().delete()

        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_student_is_denied_access(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_is_denied_access(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_rejected(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserCreateViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/accounts/create/"

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

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

    def test_admin_can_create_student(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {
                "username": "newstudent",
                "password": "newpassword123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(username="newstudent").exists()
        )

        user = User.objects.get(username="newstudent")
        self.assertEqual(user.role, "student")

    def test_admin_can_create_teacher(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {
                "username": "newteacher",
                "password": "newpassword123",
                "role": "teacher",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="newteacher")
        self.assertEqual(user.role, "teacher")

    def test_admin_can_create_admin(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {
                "username": "newadmin",
                "password": "newpassword123",
                "role": "admin",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="newadmin")
        self.assertEqual(user.role, "admin")

    def test_created_user_password_works(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {
                "username": "newstudent",
                "password": "newpassword123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="newstudent")

        self.assertTrue(user.check_password("newpassword123"))

    def test_created_user_password_is_hashed(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {
                "username": "newstudent",
                "password": "newpassword123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="newstudent")

        self.assertNotEqual(user.password, "newpassword123")

    def test_invalid_data_returns_bad_request(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {
                "username": "",
                "password": "",
                "role": "invalid",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_username_returns_bad_request(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {
                "username": "student",
                "password": "newpassword123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_is_denied_access(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            self.url,
            {
                "username": "newstudent",
                "password": "newpassword123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_is_denied_access(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.post(
            self.url,
            {
                "username": "newstudent",
                "password": "newpassword123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_rejected(self):
        response = self.client.post(
            self.url,
            {
                "username": "newstudent",
                "password": "newpassword123",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserDetailViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

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

        self.target_user = User.objects.create_user(
            username="target",
            password="targetpassword",
            first_name="Test",
            last_name="User",
            email="target@example.com",
            role="student"
        )

        self.url = f"/api/accounts/users/{self.target_user.id}/"

    def test_admin_can_retrieve_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_correct_user_is_returned(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.data["id"], self.target_user.id)
        self.assertEqual(response.data["username"], "target")

    def test_expected_fields_are_returned(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        expected_fields = {
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
        }

        self.assertEqual(set(response.data.keys()), expected_fields)

    def test_password_is_not_exposed(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertNotIn("password", response.data)

    def test_nonexistent_user_returns_not_found(self):
        self.client.force_authenticate(user=self.admin)

        url = "/api/accounts/users/999999/"

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_is_denied_access(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_is_denied_access(self):
        self.client.force_authenticate(user=self.teacher)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_rejected(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserDeleteViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

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

        self.target_user = User.objects.create_user(
            username="target",
            password="password123",
            role="student"
        )

    def test_admin_can_delete_another_user(self):
        self.client.force_authenticate(user=self.admin)

        url = f"/api/accounts/{self.target_user.id}/delete/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_deleted_user_is_removed_from_database(self):
        self.client.force_authenticate(user=self.admin)

        user_id = self.target_user.id
        url = f"/api/accounts/{user_id}/delete/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            User.objects.filter(id=user_id).exists()
        )

    def test_admin_cannot_delete_themselves(self):
        self.client.force_authenticate(user=self.admin)

        url = f"/api/accounts/{self.admin.id}/delete/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(
            User.objects.filter(id=self.admin.id).exists()
        )

    def test_student_is_denied_access(self):
        self.client.force_authenticate(user=self.student)

        url = f"/api/accounts/{self.target_user.id}/delete/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_is_denied_access(self):
        self.client.force_authenticate(user=self.teacher)

        url = f"/api/accounts/{self.target_user.id}/delete/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_is_rejected(self):
        url = f"/api/accounts/{self.target_user.id}/delete/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_user_returns_not_found(self):
        self.client.force_authenticate(user=self.admin)

        url = "/api/accounts/999999/delete/"

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
