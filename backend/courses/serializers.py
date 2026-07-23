from rest_framework import serializers
from .models import Enrolment, Course

class EnrolmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.subject_name", read_only = True)
    course_code = serializers.CharField(source="course.code", read_only = True)
    teacher = serializers.CharField(source="course.teacher.username", read_only=True)

    class Meta:
        model = Enrolment
        fields= [
            "id",
            "course",
            "course_name",
            "course_code",
            "teacher",
            "status",
            "progress",
            "grade",
            "enrolled_at",
        ]


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"

        
class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "subject_name", "code"]

class CreateEnrolmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enrolment
        fields = [
            "student",
            "course",
        ]