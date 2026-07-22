from django.urls import path
from .views import RegisterView, get_user_role, user_fields, UserCreateView, student_list
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', TokenObtainPairView.as_view()),

    #This is for token refreshing
    path('refresh/', TokenRefreshView.as_view()),

    #Below is for testing Get Request decorator
    path('user-role/', get_user_role),

    path("user-fields/", user_fields, name="user-fields"),

    path('create/', UserCreateView.as_view(), name="user-create"),

    path('students/', student_list),

  ]