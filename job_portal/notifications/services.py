from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

def create_job_posted_notifications(job):
    """Create notifications for all users when a job is posted"""
    users = User.objects.exclude(id=job.publisher.id)
    notifications = [
        Notification(
            user=user,
            title="New job posted",
            message=f"{job.publisher.first_name} {job.publisher.last_name} posted a {job.title} job",
            target_id=str(job.id)
        )
        for user in users
    ]
    Notification.objects.bulk_create(notifications)

def create_follow_request_notification(follow):
    """Create notification when someone sends a follow request"""
    Notification.objects.create(
        user=follow.following,
        title="New follow request",
        message=f"{follow.follower.first_name} {follow.follower.last_name} sent you a follow request",
        target_id=str(follow.follower.id)
    )