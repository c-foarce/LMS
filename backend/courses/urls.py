from django.urls import path
from .views import MyEnrolmentsView

urlpatterns = [
    #Returns all enrolments the requested user has
    path('enrolments/me/', MyEnrolmentsView.as_view(), name='my-enrolments')
  
]