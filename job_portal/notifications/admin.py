from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['notification_type', 'recipient', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at', 'notification_type']
    search_fields = ['message', 'recipient__email']