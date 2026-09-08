from django.test import TestCase

from accounts.models import User
from accounts.serializers import *


class RegisterSerializerTest(TestCase):

    def test_valid_student_data_is_valid(self):
        serializer = RegisterSerializer(
            data={
                "username": "student",
                "password": "password123",
                "role": "student",
            }
        )

        self.assertTrue(serializer.is_valid())

    def test_valid_teacher_data_is_valid(self):
        serializer = RegisterSerializer(
            data={
                "username": "teacher",
                "password": "password123",
                "role": "teacher",
            }
        )

        self.assertTrue(serializer.is_valid())

    def test_invalid_role_is_rejected(self):
        serializer = RegisterSerializer(
            data={
                "username": "student",
                "password": "password123",
                "role": "invalid",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("role", serializer.errors)

    def test_duplicate_username_is_rejected(self):
        User.objects.create_user(
            username="student",
            password="password123",
            role="student",
        )

        serializer = RegisterSerializer(
            data={
                "username": "student",
                "password": "differentpassword",
                "role": "student",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)

    def test_create_hashes_password(self):
        serializer = RegisterSerializer(
            data={
                "username": "student",
                "password": "password123",
                "role": "student",
            }
        )

        self.assertTrue(serializer.is_valid())

        user = serializer.save()

        self.assertNotEqual(
            user.password,
            "password123"
        )

        self.assertTrue(
            user.check_password("password123")
        )

    def test_password_is_write_only(self):
        serializer = RegisterSerializer()

        self.assertTrue(
            serializer.fields["password"].write_only
        )


class UserSerializerTest(TestCase):

    def test_valid_user_data_is_valid(self):
        serializer = UserSerializer(
            data={
                "username": "student",
                "password": "password123",
                "role": "student",
            }
        )

        self.assertTrue(serializer.is_valid())

    def test_invalid_role_is_rejected(self):
        serializer = UserSerializer(
            data={
                "username": "student",
                "password": "password123",
                "role": "invalid",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("role", serializer.errors)

    def test_create_hashes_password(self):
        serializer = UserSerializer(
            data={
                "username": "student",
                "password": "password123",
                "role": "student",
            }
        )

        self.assertTrue(serializer.is_valid())

        user = serializer.save()

        self.assertNotEqual(
            user.password,
            "password123"
        )

        self.assertTrue(
            user.check_password("password123")
        )

    def test_password_is_write_only(self):
        serializer = UserSerializer()

        self.assertTrue(
            serializer.fields["password"].write_only
        )


class StudentListSerializerTest(TestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username="student",
            password="password123",
            first_name="Test",
            last_name="Student",
            email="student@example.com",
            role="student",
        )

    def test_returns_id_and_username(self):
        serializer = StudentListSerializer(
            self.student
        )

        self.assertEqual(
            set(serializer.data.keys()),
            {"id", "username"}
        )

    def test_does_not_expose_other_user_fields(self):
        serializer = StudentListSerializer(
            self.student
        )

        self.assertNotIn(
            "password",
            serializer.data
        )

        self.assertNotIn(
            "email",
            serializer.data
        )

        self.assertNotIn(
            "role",
            serializer.data
        )


class AllUsersListSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="student",
            password="password123",
            first_name="Test",
            last_name="Student",
            email="student@example.com",
            role="student",
        )

    def test_returns_expected_user_fields(self):
        serializer = AllUsersListSerializer(
            self.user
        )

        expected_fields = {
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
        }

        self.assertEqual(
            set(serializer.data.keys()),
            expected_fields
        )

    def test_password_is_not_exposed(self):
        serializer = AllUsersListSerializer(
            self.user
        )

        self.assertNotIn(
            "password",
            serializer.data
        )


class AdminUserEditSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="student",
            password="oldpassword",
            first_name="Original",
            last_name="User",
            email="original@example.com",
            role="student",
        )

    def test_valid_edit_data_is_valid(self):
        serializer = AdminUserEditSerializer(
            self.user,
            data={
                "first_name": "Updated",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

    def test_can_update_normal_user_fields(self):
        serializer = AdminUserEditSerializer(
            self.user,
            data={
                "first_name": "Updated",
                "last_name": "Person",
                "email": "updated@example.com",
                "role": "teacher",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertEqual(
            updated_user.first_name,
            "Updated"
        )

        self.assertEqual(
            updated_user.last_name,
            "Person"
        )

        self.assertEqual(
            updated_user.email,
            "updated@example.com"
        )

        self.assertEqual(
            updated_user.role,
            "teacher"
        )

    def test_password_is_changed_and_hashed(self):
        serializer = AdminUserEditSerializer(
            self.user,
            data={
                "password": "newpassword",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertTrue(
            updated_user.check_password("newpassword")
        )

        self.assertFalse(
            updated_user.check_password("oldpassword")
        )

        self.assertNotEqual(
            updated_user.password,
            "newpassword"
        )

    def test_blank_password_does_not_change_existing_password(self):
        serializer = AdminUserEditSerializer(
            self.user,
            data={
                "password": "",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertTrue(
            updated_user.check_password("oldpassword")
        )

    def test_omitted_password_does_not_change_existing_password(self):
        serializer = AdminUserEditSerializer(
            self.user,
            data={
                "first_name": "Updated",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertTrue(
            updated_user.check_password("oldpassword")
        )

    def test_invalid_role_is_rejected(self):
        serializer = AdminUserEditSerializer(
            self.user,
            data={
                "role": "invalid",
            },
            partial=True,
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("role", serializer.errors)

    def test_password_is_write_only(self):
        serializer = AdminUserEditSerializer(
            self.user
        )

        self.assertTrue(
            serializer.fields["password"].write_only
        )
