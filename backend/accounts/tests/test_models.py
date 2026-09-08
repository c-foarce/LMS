from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User


class UserModelTest(TestCase):

    def test_create_student(self):
        user = User.objects.create_user(
            username="alice",
            password="password123",
            role="student"
        )

        self.assertEqual(user.username, "alice")
        self.assertEqual(user.role, "student")
        self.assertTrue(user.check_password("password123"))

    def test_default_role_is_student(self):
        user = User.objects.create_user(
            username="bob",
            password="password123"
        )

        self.assertEqual(user.role, User.Roles.STUDENT)

    def test_create_teacher(self):
        user = User.objects.create_user(
            username="teacher",
            password="password123",
            role="teacher"
        )

        self.assertEqual(user.role, User.Roles.TEACHER)

    def test_create_admin(self):
        user = User.objects.create_user(
            username="admin",
            password="password123",
            role="admin"
        )

        self.assertEqual(user.role, User.Roles.ADMIN)

    def test_password_is_hashed(self):
        user = User.objects.create_user(
            username="alice",
            password="password123"
        )

        self.assertNotEqual(user.password, "password123")
        self.assertTrue(user.check_password("password123"))

    def test_username_must_be_unique(self):
        User.objects.create_user(
            username="alice",
            password="password123"
        )

        with self.assertRaises(Exception):
            User.objects.create_user(
                username="alice",
                password="differentpassword"
            )
