from django.shortcuts import render

from rest_framework import generics
from .models import User, Enrolment
from .serializers import RegisterSerializer

from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


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



##TO DO
