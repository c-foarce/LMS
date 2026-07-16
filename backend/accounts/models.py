from django.contrib.auth.models import AbstractUser
from django.db import models
# Create your models here.




class User(AbstractUser):

    class Roles(models.TextChoices):
        STUDENT = "student", "Student"
        TEACHER = "teacher", "Teacher"
        ADMIN = "admin", "Admin"

    role = models.CharField(
        max_length=20, 
        choices = Roles.choices,
        default = Roles.STUDENT
    )

    courses = models.ManyToManyField(
        "courses.Course",
        through="courses.Enrolment",
        blank = True
    )

