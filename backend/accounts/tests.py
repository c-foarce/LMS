from django.test import TestCase
from .models import User
# Create your tests here.

class UserModelTest(TestCase):
    def test_create_student(self):

        user=User.objects.create_user(
            username="alice",
            password="password123",
            role="student"
        )

        self.assertEqual(user.username, "alice")
        self.assertEqual(user.role, "student")
        self.assertTrue(user.check_password("password123"))



    def test_default_role_is_student(self):

        user=User.objects.create_user(
            username="bob",
            password="password123"
        )

        self.assertEqual(user.role, User.Roles.STUDENT)