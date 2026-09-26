from rest_framework.permissions import BasePermission

from accounts.models import User

class IsAdmin(BasePermission):
    
    #Allow access only to those with admin role


    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role == User.Roles.ADMIN
        )
    

class IsTeacherOrAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role in [User.Roles.TEACHER, User.Roles.ADMIN]
        )

class IsStudent(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role == User.Roles.STUDENT
        )

class IsTeacher(BasePermission):
        
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role == User.Roles.TEACHER
        )

class IsCourseOwnerOrAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):

        if request.user.role == User.Roles.ADMIN:
            return True

        if request.user.role == User.Roles.TEACHER:
            return obj.teacher == request.user

        return False

class IsEnrolmentOwnerOrAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):

        if request.user.role == User.Roles.ADMIN:
            return True

        if request.user.role == User.Roles.TEACHER:
            return obj.course.teacher == request.user

        return False