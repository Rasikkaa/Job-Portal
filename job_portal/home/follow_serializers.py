from rest_framework import serializers
from authentication.models import User
from .follow_models import Follow
from posts.models import Post

class UserMinimalSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'job_role', 'profile_image']
    
    def get_profile_image(self, obj):
        try:
            return obj.userprofile.profile_image.url if obj.userprofile.profile_image else None
        except:
            return None

class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'job_role', 'followers_count', 'following_count', 'posts_count', 'posts']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj).count()
    
    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj).count()
    
    def get_posts_count(self, obj):
        return Post.objects.filter(author=obj, is_active=True).count()
    
    def get_posts(self, obj):
        posts = Post.objects.filter(author=obj, is_active=True).prefetch_related('images')
        if not posts:
            return None
        
        return [{
            'id': post.id,
            'description': post.description,
            'images': [{'id': img.id, 'url': img.image.url} for img in post.images.all()] or None
        } for post in posts]

class FollowSerializer(serializers.ModelSerializer):
    follower = UserMinimalSerializer(read_only=True)
    following = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']