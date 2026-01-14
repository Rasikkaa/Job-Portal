from rest_framework import serializers
from authentication.models import User
from .models import Post, PostImage, PostComment


class AuthorSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'job_role', 'avatar_url']
    
    def get_avatar_url(self, obj):
        try:
            if obj.job_role == 'company':
                # For company users, get company logo
                return obj.companyprofile.company_logo.url if obj.companyprofile.company_logo else None
            else:
                # For individual users, get profile image
                return obj.userprofile.profile_image.url if obj.userprofile.profile_image else None
        except:
            return None


class PostImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = PostImage
        fields = ['id', 'url']
    
    def get_url(self, obj):
        return obj.image.url if obj.image else None


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'description', 'images', 'likes_count', 'comments_count', 'liked', 'created_at', 'updated_at', 'is_owner']
        read_only_fields = ['author', 'created_at', 'updated_at', 'likes_count', 'comments_count']
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.author
    
    def get_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        max_length=20
    )
    
    class Meta:
        model = Post
        fields = ['description', 'images']
    
    def validate_images(self, value):
        if len(value) > 20:
            raise serializers.ValidationError("Maximum 20 images allowed per post.")
        
        for image in value:
            if image.size > 5 * 1024 * 1024:  # 5MB
                raise serializers.ValidationError("Image size cannot exceed 5MB.")
            
            if not image.content_type.startswith('image/'):
                raise serializers.ValidationError("Only image files are allowed.")
        
        return value
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        post = Post.objects.create(**validated_data)
        
        for i, image in enumerate(images_data, 1):
            PostImage.objects.create(post=post, image=image, order=i)
        
        return post
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        
        # Update description
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        
        # Replace images if provided
        if images_data is not None:
            instance.images.all().delete()
            for i, image in enumerate(images_data, 1):
                PostImage.objects.create(post=instance, image=image, order=i)
        
        return instance


class ImageAddSerializer(serializers.Serializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        max_length=20
    )
    
    def validate_images(self, value):
        for image in value:
            if image.size > 5 * 1024 * 1024:  # 5MB
                raise serializers.ValidationError("Image size cannot exceed 5MB.")
            
            if not image.content_type.startswith('image/'):
                raise serializers.ValidationError("Only image files are allowed.")
        
        return value


class PostCommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(source='user', read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = PostComment
        fields = ['id', 'author', 'text', 'created_at', 'is_owner']
        read_only_fields = ['author', 'created_at']
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'job_role']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


