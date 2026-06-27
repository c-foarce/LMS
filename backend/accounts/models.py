from django.contrib.auth.models import AbstractUser
from django.db import models
# Create your models here.

class Class(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

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

    enrolment = models.ManyToManyField(
        Class,
        blank = True
    )
