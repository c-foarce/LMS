from rest_framework import serializers
from .models import User, Enrolment


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'role']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    

class EnrolmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only = True)
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