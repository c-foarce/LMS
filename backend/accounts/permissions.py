from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    
    #Allow access only to those with admin role


    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role == "admin"
        )
    

class IsTeacherOrAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role in ["teacher", "admin"]
        )