from django.urls import path
from .views import RegisterView, get_user_role, MyEnrolmentsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', TokenObtainPairView.as_view()),

    #This is for token refreshing
    path('refresh/', TokenRefreshView.as_view()),

    #Below is for testing Get Request decorator
    path('user-role/', get_user_role),

    #Returns all enrolments the requested user has
    path('enrolments/me/', MyEnrolmentsView.as_view(), name='my-enrolments')
    ]