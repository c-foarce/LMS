from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404

from .models import Enrolment, Course
from . import serializers

from accounts.models import User
from accounts import permissions




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
    permission_classes = [permissions.IsTeacherOrAdmin]

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
    permission_classes = [permissions.IsTeacherOrAdmin, permissions.IsCourseOwnerOrAdmin]

    
    
# Gets all Courses a "teacher" User owns
class TeachingCoursesView(generics.ListAPIView):
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Course.objects.filter(
                teacher=self.request.user
            )
        )
#increments selected course by 1, after cheking if it's able to
class SubmitProgress(APIView):

    def post(self, request, pk):

        enrolment = get_object_or_404(
            Enrolment,
            pk = pk,
            student=request.user
        )

        if enrolment.completed_submissions >= enrolment.course.total_submissions:
            return Response(
                {
                    "detail":"All required submissions have already been completed"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        enrolment.completed_submissions += 1

        if enrolment.completed_submissions == enrolment.course.total_submissions:
            enrolment.status = Enrolment.Status.COMPLETED

        
        enrolment.save()

        serializer = serializers.EnrolmentSerializer(enrolment)
        return Response(serializer.data)


class TeacherProgressView(generics.ListAPIView):
    serializer_class = serializers.TeacherCourseProgressSerializer
    permission_classes = [permissions.IsTeacher]

    def get_queryset(self):
        return Course.objects.filter(
            teacher=self.request.user
        )

    
##########################
###### WIDGET TYPES ######
WIDGET_TYPES = {
    "CharField": "text",
    "TextField": "textarea",
    "PositiveIntegerField": "number",
    "IntegerField": "number",
    "FloatField": "number",
    "ForeignKey": "select",
}
#########################
#########################


#########################
###### FIELD ORDER ######
FIELD_ORDER = [
"subject_name",
"code", 
"teacher",
"description",
"total_submissions",
]

# Gets name, type, and required Course fields
## USES WIDGET_TYPES



class CourseFieldsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        fields = []

        for field_name in FIELD_ORDER:

            field = Course._meta.get_field(field_name)

            fields.append({
                "name": field.name,
                "widget": WIDGET_TYPES.get(
                    field.get_internal_type(),
                    "text"
                ),
                "required": not field.blank
            })

        teacher_options = []

        if getattr(request.user, "role", None) == "admin":

            teachers = User.objects.filter(role="teacher")

            teacher_options = [
                {
                    "id": teacher.id,
                    "username": teacher.username,
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
#this will be changed to a geneircs.apiview


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def course_list(request):

#     courses = Course.objects.all()
#     serializer = serializers.CourseListSerializer(courses, many=True)

#     return Response(serializer.data)



# As above but as a class, keep to show/ask
class CourseListView(generics.ListAPIView):

    queryset = Course.objects.all()
    serializer_class = serializers.CourseListSerializer
    permission_classes = [IsAuthenticated]




# Creates an Enrolment (Admin method)
class EnrolmentCreateView(generics.CreateAPIView):
    serializer_class = serializers.CreateEnrolmentSerializer
    permission_classes = [permissions.IsTeacherOrAdmin]


# Creates an Enrolment (Student method)
class StudentEnrolmentCreateView(generics.CreateAPIView):
    serializer_class=serializers.StudentEnrolmentSerializer
    permission_classes=[permissions.IsStudent]


# Gets details on one Course
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsAuthenticated]


# Activates/Deactivates a course to no longer be shown for enrolments
class CourseToggleActiveView(APIView):
    permission_classes = [IsAuthenticated, permissions.IsCourseOwnerOrAdmin]

    def patch(self, request, pk):

        course = get_object_or_404(Course, pk=pk)

        course.is_active = not course.is_active

        course.save()

        serializer = serializers.CourseSerializer(course)

        return Response(serializer.data)

class AvaliableCourseListView(generics.ListAPIView):
    serializer_class = serializers.CourseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == "teacher":
            return Course.objects.filter(
                teacher=user,
                is_active=True
            )
        return Course.objects.filter(is_active=True)


class EnrolmentDeleteView(generics.DestroyAPIView):

    queryset = Enrolment.objects.all()
    permission_classes = [permissions.IsTeacherOrAdmin,IsAuthenticated]


class ListAllEnrolmentsView(generics.ListAPIView):
        
    queryset = Enrolment.objects.all()
    permission_classes = [IsAuthenticated,permissions.IsAdmin]
    serializer_class=serializers.EnrolmentSerializer


class CourseDeleteView(generics.DestroyAPIView):

    queryset = Course.objects.all()
    permission_classes = [permissions.IsAdmin]

    def destroy(self, request, *args, **kwargs):

        course = self.get_object()

        if course.enrolments.exists():
            return Response(
                {
                    "detail": "Course cannot be deleted while students are enrolled."
                },
                status = status.HTTP_400_BAD_REQUEST
            )
        course.delete()

        return Response(
            status = status.HTTP_204_NO_CONTENT
        )

class GradeEnrolmentView(generics.UpdateAPIView):

    serializer_class = serializers.GradeEnrolmentSerializer
    permission_classes = [permissions.IsTeacher]

    def get_queryset(self):
        return Enrolment.objects.filter(
            course__teacher=self.request.user
        )

class StudentGradeView(generics.ListAPIView):
    serializer_class= serializers.EnrolmentSerializer
    permission_classes=[permissions.IsStudent]

    def get_queryset(self):
        return Enrolment.objects.filter(
            student=self.request.user,
            status=Enrolment.Status.COMPLETED,
        ).exclude(
            grade=""
        )
    pass


class AcknoweldgeCompletionView(generics.UpdateAPIView):
    serializer_class=serializers.EnrolmentSerializer
    permission_classes=[permissions.IsStudent]

    def get_queryset(self):
        return Enrolment.objects.filter(
            student=self.request.user
        )
    def update(self, request, *args, **kwargs):

        enrolment = self.get_object()

        if enrolment.completed_submissions < enrolment.course.total_submissions:
            return Response(
                {
                    "detail": "You cannot acknowledge completion until all submissions are complete."
                },
                statut=status.HTTP_400_BAD_REQUEST
            )

        if not enrolment.grade:
            return Response(
                {
                    "detail": "You cannot acknowledge completion until your course has been graded."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrolment.student_completed = True
        enrolment.save()

        serializer = self.get_serializer(enrolment)

        return Response(serializer.data)