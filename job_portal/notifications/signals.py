from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from home.follow_models import Follow
from jobs.models import Job
from posts.models import PostLike, PostComment
from .models import Notification

User = get_user_model()

@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.following,
            sender=instance.follower,
            notification_type='follow',
            message=f"{instance.follower.get_full_name()} sent you a follow request",
            object_id=instance.follower.id
        )

@receiver(post_save, sender=Job)
def create_job_notification(sender, instance, created, **kwargs):
    if created:
        users = User.objects.exclude(id=instance.publisher.id)
        notifications = [
            Notification(
                recipient=user,
                sender=instance.publisher,
                notification_type='job',
                message=f"{instance.publisher.get_full_name()} posted a {instance.title} job",
                object_id=instance.id
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications)

@receiver(post_save, sender=PostLike)
def create_like_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.author:
        Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.user,
            notification_type='like',
            message=f"{instance.user.get_full_name()} liked your post",
            object_id=instance.post.id
        )

@receiver(post_save, sender=PostComment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created and instance.user != instance.post.author:
        Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.user,
            notification_type='comment',
            message=f"{instance.user.get_full_name()} commented on your post",
            object_id=instance.post.id
        )