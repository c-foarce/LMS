from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
#from courses.models import Course, Enrolment

#admin.site.register(Course)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {
            "fields": ("role",)
        }),
    )

#admin.site.register(Enrolment)
##DO EVENETUALLY   , i have the sql file reader thingy thank you andy :)