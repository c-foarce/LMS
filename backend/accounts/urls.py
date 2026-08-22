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
        name = "register",
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name = "login",
    ),

    # Token refreshing
    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name = "token-refresh",
    ),

    path(
        "<int:pk>/delete/",
        views.UserDeleteView.as_view(),
        name = "delete-user"
    ),

    # Returns current authenticated user's role
    path(
        "user-role/",
        views.UserRoleView.as_view(),
        name = "user-role",
    ),

    # Returns dynamic user form fields
    path(
        "user-fields/",
        views.UserFieldsView.as_view(),
        name = "user-fields",
    ),

    # Admin creates users
    path(
        "create/",
        views.UserCreateView.as_view(),
        name = "user-create",
    ),

    # Returns students
    path(
        "students/",
        views.StudentListView.as_view(),
        name = "student-list",
    ),

    # Returns all users
    path(
        "all/",
        views.AllUserListView.as_view(),
        name = "all-users"
    ),

    # User editing for Admins
    path(
        "users/<int:pk>/edit/",
        views.AdminUserEditView.as_view(),
        name = "admin-user-edit"
    ),

    # Single User info for Admins
    path(
        "users/<int:pk>/",
        views.UserDetailView.as_view(),
        name="admin-user-detail"
    ),

]