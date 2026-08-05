from django.urls import path

from . import views


urlpatterns = [

    # Course metadata / dynamic fields
    path(
        "course-fields/",
        views.CourseFieldsView.as_view(),
        name="course-fields",
    ),

    # Course creation
    path(
        "create/",
        views.CourseCreateView.as_view(),
        name="course-create",
    ),

    # Course detail and editing
    path(
        "<int:pk>/",
        views.CourseDetailView.as_view(),
        name="course-details",
    ),

    path(
        "<int:pk>/edit/",
        views.CourseEditView.as_view(),
        name="course-update",
    ),

    # Course lists
    path(
        "list/",
        views.CourseListView.as_view(),
        name="course-list",
    ),

    path(
        "teaching/",
        views.TeachingCoursesView.as_view(),
        name="teaching-courses",
    ),

    # Enrolments
    path(
        "enrolments/me/",
        views.MyEnrolmentsView.as_view(),
        name="my-enrolments",
    ),

    path(
        "enrolments/create/",
        views.EnrolmentCreateView.as_view(),
        name="enrolment-create",
    ),
    path("enrolments/<int:pk>/submit/",
         views.SubmitProgress.as_view(),
         name="submit-progress"),

]