from django.shortcuts import render

from rest_framework import generics
from .models import User
from .serializers import RegisterSerializer

# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


##TO DO
