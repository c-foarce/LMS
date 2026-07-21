from django.shortcuts import render

from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import RegisterSerializer, UserSerializer
from .permissions import IsAdminRole



# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class UserCreateView(generics.CreateAPIView):

    serializer_class= UserSerializer
    permission_classes = [IsAdminRole]


@api_view(["GET"])  
#Defines this as API endpoint, [] specify allowed method(s)

@permission_classes([IsAuthenticated])
# Requires the request to come from an authenticated user.
# Because we use JWT authentication, DRF checks the token and populates request.user.
# Remove/change this if the endpoint should be public.

def get_user_role(request):
    # This function runs when the matching URL is called.
    # "request" contains everything sent by the frontend:
    # - request.user -> logged-in user
    # - request.method -> GET/POST/etc.
    # - request.data -> JSON data sent from frontend (mainly POST/PUT)

    return Response({
        "username": request.user.username,
        "role": request.user.role
    })
    # Response sends JSON back to the frontend.
    # Axios receives this as res.data.


@api_view(["GET"])
@permission_classes([IsAdminRole])
def user_fields(request):

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

        #get model by field name
        field = User._meta.get_field(field_name)

        field_info = {
            "name": field.name,
            "type": field.get_internal_type(),
            "required": not field.blank,
        }

        #if field has choices, send all to frontend to it can render a dropdown
        if field.choices:
            field_info["choices"] = [
                {
                    "value": value, 
                    "label": label,
                }
                for value, label in field.choices
            ]
        fields.append(field_info)


    return Response({
        "fields": fields
    })
    # for field in User._meta.fields:

    #     if field.name not in allowed_fields:
    #         continue

    #     field_info = {
    #         "name": field.name,
    #         "type": field.get_internal_type(),
    #         "required": not field.blank,
    #     }

    #     if field.name == "role":
    #         field_info["choices"] = [
    #             {
    #                 "value": value,
    #                 "label": label, 
    #             }
    #             for value,label in User.Roles.choices
    #         ]
        
    #     fields.append(field_info)

