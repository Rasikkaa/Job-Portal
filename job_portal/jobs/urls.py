from django.urls import path
from .views import JobListCreateView, JobDetailView, MyJobsView, ApplyJobView, JobApplicationsView, MyApplicationsView, ApplicationDetailView

urlpatterns = [
    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<uuid:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('my-jobs/', MyJobsView.as_view(), name='my-jobs'),
    path('jobs/<uuid:job_id>/apply/', ApplyJobView.as_view(), name='apply-job'),
    path('jobs/<uuid:job_id>/applications/', JobApplicationsView.as_view(), name='job-applications'),
    path('applications/my/', MyApplicationsView.as_view(), name='my-applications'),
    path('applications/<uuid:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]