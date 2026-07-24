from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Enrolment, Course
from . import serializers

from accounts.models import User
from accounts.permissions import IsTeacherOrAdmin, IsAdminRole, IsCourseOwnerOrAdmin




# Create your views here.

# Gets all Enrolments
class MyEnrolmentsView(generics.ListAPIView):
    serializer_class = serializers.EnrolmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrolment.objects.filter(student=self.request.user)
    

# Creates a new Course
class CourseCreateView(generics.CreateAPIView):
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsTeacherOrAdmin]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "teacher":
            serializer.save(teacher=user)
        elif user.role == "admin":
            serializer.save()


# Edits a created Course
class CourseEditView(generics.UpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsTeacherOrAdmin, IsCourseOwnerOrAdmin]

    
    
# Gets all Courses a "teacher" User owns
class TeachingCoursesView(generics.ListAPIView):
    serializer_class = serializers.CourseSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return (
            Course.objects.filter(
                teacher=self.request.user
            )
        )


    

# Gets name, type, and required Course fields
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_fields(request):

    print(request.user)
    print(getattr(request.user, "role", "NO ROLE"))
    fields = []

    for field in Course._meta.fields:

        if field.name in ["id", "created_at"]:
            continue

        fields.append({
            "name": field.name,
            "type": field.get_internal_type(),
            "required": not field.blank,
        })

    teacher_options=[]

    if getattr(request.user, "role", None) == "admin":
        teachers=User.objects.filter(role="teacher")

        teacher_options = [
            {
                "id": teacher.id,
                "username": teacher.username
            }
            for teacher in teachers
        ]

    return Response({
    "role": getattr(request.user, "role", None),
    "fields": fields,
    "teacher_id": request.user.id,
    "teacher_options": teacher_options,
})


# Gets a list of all Courses
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_list(request):

    courses = Course.objects.all()
    serializer = serializers.CourseListSerializer(courses, many=True)

    return Response(serializer.data)


# Creates an Enrolment
class EnrolmentCreateView(generics.CreateAPIView):
    serializer_class = serializers.CreateEnrolmentSerializer
    permission_classes=[IsAdminRole]


# Gets details on one Course
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes=[IsAuthenticated]