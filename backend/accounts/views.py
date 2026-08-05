from django.shortcuts import render

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import RegisterSerializer, UserSerializer, StudentListSerializer
from .permissions import IsAdminRole



# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class UserCreateView(generics.CreateAPIView):

    serializer_class= UserSerializer
    permission_classes = [IsAdminRole]




# #This can and probably should be changed to a generics views with permission class inside the class

# @api_view(["GET"])  
# @permission_classes([IsAuthenticated])
# def get_user_role(request):

#     return Response({
#         "username": request.user.username,
#         "role": request.user.role
#     })


class UserRoleView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "role": request.user.role
        })


# @api_view(["GET"])
# @permission_classes([IsAdminRole])
# def user_fields(request):

#     allowed_fields = [
#         "first_name",
#         "last_name",
#         "username",
#         "password",
#         "email",
#         "role",

#     ]

#     fields = []

#     for field_name in allowed_fields:

#         #get model by field name
#         field = User._meta.get_field(field_name)

#         field_info = {
#             "name": field.name,
#             "type": field.get_internal_type(),
#             "required": not field.blank,
#         }

#         #if field has choices, send all to frontend to it can render a dropdown
#         if field.choices:
#             field_info["choices"] = [
#                 {
#                     "value": value, 
#                     "label": label,
#                 }
#                 for value, label in field.choices
#             ]
#         fields.append(field_info)


#     return Response({
#         "fields": fields
#     })


class UserFieldsView(APIView):
    permission_classes=[IsAdminRole]

    def get(self, request):

        allowed_fields = [
            "first_name",
            "last_name",
             "username",
            "password",
            "email",
            "role",
        ]

        fields = []

        for field_name in allowed_fields:

            field=User._meta.get_field(field_name)

            field_info={
                "name": field.name, 
                "type": field.get_internal_type(),
                "required": not field.blank,
            }

            #if field has choices, send all to frontend so it can render a dropdown
            if field.choices:
                field_info["choices"] = [
                    {
                        "value": value,
                        "label": label
                    }
                    for value, label in field.choices
                ]
            fields.append(field_info)

        return Response({
            "fields": fields
        })



# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def student_list(request):

#     students = User.objects.filter(role="student")

#     serializer = StudentListSerializer(students, many=True)

#     return Response(serializer.data)


class StudentListView(generics.ListAPIView):

    serializer_class = StudentListSerializer

    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role="student")