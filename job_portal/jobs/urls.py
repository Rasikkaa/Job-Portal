from django.urls import path
from .views import JobListView, JobCreateView, JobDetailView, MyJobsView, ApplyJobView, JobApplicationsView, MyApplicationsView, ApplicationDetailView, JobStatsView

urlpatterns = [
    path('', JobListView.as_view(), name='job-list'),
    path('create/', JobCreateView.as_view(), name='job-create'),
    path('stats/', JobStatsView.as_view(), name='job-stats'),
    path('<uuid:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('my-jobs/', MyJobsView.as_view(), name='my-jobs'),
    path('<uuid:job_id>/apply/', ApplyJobView.as_view(), name='apply-job'),
    path('<uuid:job_id>/applications/', JobApplicationsView.as_view(), name='job-applications'),
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),
    path('applications/<uuid:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]