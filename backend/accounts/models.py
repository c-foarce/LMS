from django.contrib.auth.models import AbstractUser
from django.db import models
# Create your models here.

class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)

    teacher = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses_taught'
    )

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("name", "code")

    def __str__(self):
        return f"{self.name} {self.code}"

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
        Course,
        through="Enrolment",
        blank = True
    )

class Enrolment(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "active","Active"
        COMPLETED = "completed","Completed"
        DROPPED = "dropped","Dropped"

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrolments"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrolments"
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices= Status.choices,
        default=Status.ACTIVE

    )

    progress = models.IntegerField(default = 0)

    grade = models.CharField(
        max_length= 10,
        blank=True
    )

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.name}"