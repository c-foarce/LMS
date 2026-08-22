from django.urls import path

from . import views


urlpatterns = [

    # ======================
    # Course metadata
    # ======================

    path(
        "course-fields/",
        views.CourseFieldsView.as_view(),
        name="course-fields",
    ),


    # ======================
    # Course creation
    # ======================

    path(
        "create/",
        views.CourseCreateView.as_view(),
        name="course-create",
    ),


    # ======================
    # Course lists
    # ======================

    path(
        "list/",
        views.CourseListView.as_view(),
        name="course-list",
    ),

    path(
        "available/",
        views.AvaliableCourseListView.as_view(),
        name="available-courses"
    ),

    path(
        "teaching/",
        views.TeachingCoursesView.as_view(),
        name="teaching-courses",
    ),

    path(
        "teaching/progress/",
        views.TeacherProgressView.as_view(),
        name="teacher-progress"
    ),


    # ======================
    # Enrolments
    # ======================

    path(
    "enrolments/all/",
    views.ListAllEnrolmentsView.as_view(),
    name="all-enrolments",
    ), 

    path(
        "enrolments/me/",
        views.MyEnrolmentsView.as_view(),
        name="my-enrolments",
    ),

    path(
        "enrolments/create/",
        views.EnrolmentCreateView.as_view(),
        name="enrolment-create-admin",
    ),

    path(
        "enrolments/enrol/",
        views.StudentEnrolmentCreateView.as_view(),
        name="enrolment-create-student"
    ),

    path(
        "enrolments/<int:pk>/submit/",
        views.SubmitProgress.as_view(),
        name="submit-progress",
    ),

    path(
        "enrolments/<int:pk>/delete/",
        views.EnrolmentDeleteView.as_view(),
        name="delete-enrolment"
    ),

    path(
        "enrolments/<int:pk>/grade/",
        views.GradeEnrolmentView.as_view(),
        name="grade-enrolment"
    ),


    # ======================
    # Course actions
    # ======================

    path(
        "<int:pk>/toggle-active/", 
        views.CourseToggleActiveView.as_view(),
        name="course-toggle-active",
    ),

    path(
        "<int:pk>/delete/",
        views.CourseDeleteView.as_view(),
        name = "delete-course"
    ),


    # ======================
    # Course detail/editing
    # ======================

    path(
        "<int:pk>/edit/",
        views.CourseEditView.as_view(),
        name="course-update",
    ),

    path(
        "<int:pk>/",
        views.CourseDetailView.as_view(),
        name="course-details",
    ),


    # ======================
    # Grading/Completion
    # ======================

    path(
        "enrolments/my-grades/",
        views.StudentGradeView.as_view(),
        name="my-grades"
    ),

    path(
        "enrolments/<int:pk>/acknowledge/",
        views.AcknoweldgeCompletionView.as_view(),
        name="acknowledge-completion"
    ),

    path(
        "enrolments/<int:pk>/complete/",
        views.CompleteEnrolmentView.as_view(),
        name="complete-enrolment"
    ),

    path(
        "enrolments/history/",
        views.CompleteEnrolmentHistoryView.as_view(),
        name="complete-enrolment-history"
    ),


]