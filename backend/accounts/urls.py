from django.urls import path

from . import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    path(
        "register/",
        views.RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login",
    ),

    # Token refreshing
    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    # Returns current authenticated user's role
    path(
        "user-role/",
        views.get_user_role,
        name="user-role",
    ),

    # Returns dynamic user form fields
    path(
        "user-fields/",
        views.user_fields,
        name="user-fields",
    ),

    # Admin creates users
    path(
        "create/",
        views.UserCreateView.as_view(),
        name="user-create",
    ),

    # Returns students
    path(
        "students/",
        views.student_list,
        name="student-list",
    ),

]