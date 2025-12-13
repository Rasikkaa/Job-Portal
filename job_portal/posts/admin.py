from django.contrib import admin
from .models import Post, PostImage, PostLike, PostComment


class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 0


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'description', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['description', 'author__email']
    inlines = [PostImageInline]


@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'order', 'created_at']
    list_filter = ['created_at']


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'created_at']
    list_filter = ['created_at']


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'text', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['text', 'user__email']