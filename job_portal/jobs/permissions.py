from rest_framework import permissions

class IsPublisherRole(permissions.BasePermission):
    """
    Allow create/post only if request.user.job_role is 'employer' or 'company'.
    Allow safe methods (GET, HEAD, OPTIONS) for everyone.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.job_role in ('employer', 'company')

class IsPublisherOrOwner(permissions.BasePermission):
    """
    Allow modifications only if request.user is the publisher (owner) or is_staff.
    Safe methods (GET, HEAD, OPTIONS) are allowed to any request.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return obj.publisher == request.user or request.user.is_staff

class IsEmployee(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.job_role == 'employee'

class IsJobPublisher(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.job.publisher == request.user

class IsApplicantOrPublisher(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.applicant == request.user or obj.job.publisher == request.user