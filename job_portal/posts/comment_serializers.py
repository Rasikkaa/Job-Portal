from rest_framework import serializers
from authentication.models import User
from .models import PostComment


class CommentAuthorSerializer(serializers.ModelSerializer):
    # avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']
    
    # def get_avatar_url(self, obj):
    #     try:
    #         return obj.userprofile.profile_image.url if obj.userprofile.profile_image else None
    #     except:
    #         return None


class PostCommentSerializer(serializers.ModelSerializer):
    user = CommentAuthorSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = PostComment
        fields = ['id', 'user', 'text', 'created_at', 'updated_at', 'is_owner']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostComment
        fields = ['text']