from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Enrolment, Course
from .serializers import EnrolmentSerializer, CourseSerializer, CourseListSerializer, CreateEnrolmentSerializer

from accounts.models import User
from accounts.permissions import IsTeacherOrAdmin, IsAdminRole




# Create your views here.


class MyEnrolmentsView(generics.ListAPIView):
    serializer_class = EnrolmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrolment.objects.filter(student=self.request.user)
    


class CourseCreateView(generics.CreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrAdmin]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "teacher":
            serializer.save(teacher=user)
        elif user.role == "admin":
            serializer.save()
    




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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_list(request):

    courses = Course.objects.all()
    serializer = CourseListSerializer(courses, many=True)

    return Response(serializer.data)


#LaTER FOR POSTS
class EnrolmentCreateView(generics.CreateAPIView):
    serializer_class=CreateEnrolmentSerializer
    permission_classes=[IsAdminRole]