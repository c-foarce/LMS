from django.contrib import admin
from .models import Course,Enrolment

# Register your models here.

admin.site.register(Course)
admin.site.register(Enrolment)