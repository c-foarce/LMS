from rest_framework import serializers
from .models import Enrolment, Course

class EnrolmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(
        source="course.subject_name",
        read_only = True
    )
    course_code = serializers.CharField(
        source="course.code",
        read_only = True
        )
    teacher = serializers.CharField(
        source="course.teacher.username",
        read_only=True
        )

    progress = serializers.SerializerMethodField()

    class Meta:
        model = Enrolment
        fields= [
            "id",
            "course",
            "course_name",
            "course_code",
            "teacher",
            "status",
            "completed_submissions",
            "progress",
            "grade",
            "enrolled_at",
        ]

    def get_progress(self, obj):
        total = obj.course.total_submissions

        if total == 0:
            return 0
        return round(
            (obj.completed_submissions / total) * 100 
        )

class CourseSerializer(serializers.ModelSerializer):

    teacher_name = serializers.CharField(
        source="teacher.username",
        read_only=True
    )

    class Meta:
        model = Course
        fields =  [
            "id",
            "subject_name",
            "code",
            "description",
            "teacher",
            "teacher_name",
            "created_at",
        ]

        
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

class SubmitProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model=Enrolment
        fields=["progress"]