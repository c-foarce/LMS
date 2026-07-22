from django.urls import path
from .views import MyEnrolmentsView, course_fields, CourseCreateView, EnrolmentCreateView, course_list

urlpatterns = [
    #Returns all enrolments the requested user has
    path('enrolments/me/', MyEnrolmentsView.as_view(), name='my-enrolments'),
    path('course-fields/', course_fields, name='course-fields'),
    path('create/', CourseCreateView.as_view(), name='course-create'),
    path('enrolments/create/', EnrolmentCreateView.as_view(), name = "enrolment-create"),
    path('list/', course_list)
    ]