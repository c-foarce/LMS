from rest_framework import serializers
from .models import Enrolment, Course, CompletedEnrolment

class EnrolmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source = "student.username",
        read_only = True
        )

    course_name = serializers.CharField(
        source = "course.subject_name",
        read_only = True
        )
    
    course_code = serializers.CharField(
        source = "course.code",
        read_only = True
        )
    
    teacher = serializers.CharField(
        source = "course.teacher.username",
        read_only = True
        )

    progress = serializers.SerializerMethodField()

    class Meta:
        model = Enrolment
        fields= [
            "id",
            "student_name",
            "course",
            "course_name",
            "course_code",
            "teacher",
            "status",
            "completed_submissions",
            "progress",
            "grade",
            "student_completed",
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
            "total_submissions",
            "teacher_name",
            "created_at",
            "is_active",
        ]

class CourseListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="teacher.username",
        read_only=True,
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "subject_name",
            "code",
            "is_active",
            "teacher_name",
            "total_submissions"
        ]

class CreateEnrolmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enrolment
        fields = [
            "student",
            "course",
        ]

    def validate_course(self, course):

        request = self.context["request"]
        user = request.user

        if not course.is_active:
            raise serializers.ValidationError(
                "This course is no longer accepting enrolments."
            )

        if user.role == "teacher" and course.teacher != user:
            raise serializers.ValidationError(
                "You can only create enrolments for your own courses."
            )

        return course

    def validate(self, attrs):

        student = attrs["student"]
        course = attrs["course"]

        if Enrolment.objects.filter(
            student=student,
            course=course
        ).exists():
            raise serializers.ValidationError(
                "This student is already enrolled on this course."
            )

        return attrs


class StudentEnrolmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enrolment
        fields = ["course"]

    def validate_course(self, course):
        if not course.is_active:
            raise serializers.ValidationError(
                "This course is no longer accepting enrolments"
            )

        return course

    def create(self, validated_data):
        return Enrolment.objects.create(
            student=self.context["request"].user,
            **validated_data
        )


class SubmitProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model=Enrolment
        fields=["progress"]#

class GradeEnrolmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enrolment
        fields = ["grade"]

class TeacherCourseProgressSerializer(serializers.ModelSerializer):

    completed_students = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "subject_name",
            "code",
            "completed_students",
        ]

    def get_completed_students(self, obj):

        enrolments = obj.enrolments.filter(
            status=Enrolment.Status.COMPLETED
        )

        return EnrolmentSerializer(
            enrolments,
            many=True
        ).data

class CompletedEnrolmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = CompletedEnrolment

        fields = [
            "id",

            "original_enrolment_id",

            "student_id",
            "student_username",
            "student_first_name",
            "student_last_name",

            "teacher_id",
            "teacher_username",
            "teacher_first_name",
            "teacher_last_name",

            "course_id",
            "course_name",
            "course_code",

            "grade",
            "completed_at",
        ]

        read_only_fields = [
            "id",

            "original_enrolment_id",

            "student_id",
            "student_username",
            "student_first_name",
            "student_last_name",

            "teacher_id",
            "teacher_username",
            "teacher_first_name",
            "teacher_last_name",

            "course_id",
            "course_name",
            "course_code",

            "grade",
            "completed_at",
        ]