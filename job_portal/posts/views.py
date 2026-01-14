from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from authentication.models import User
from notifications.models import Notification
from .models import Post, PostImage, PostLike, PostComment, PostShare
from .serializers import PostSerializer, PostCreateSerializer, ImageAddSerializer, PostCommentSerializer, UserListSerializer
from .permissions import IsAuthorOrReadOnly


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.filter(is_active=True).select_related('author').prefetch_related('images')
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['description', 'author__first_name', 'author__last_name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('my_posts') == 'true':
            queryset = queryset.filter(author=self.request.user)
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                return Response({'detail': 'Post created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': 'Failed to create post'}, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'total_count': queryset.count(),
            'results': serializer.data
        })


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.filter(is_active=True).select_related('author').prefetch_related('images')
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostCreateSerializer
        return PostSerializer
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Post updated successfully'}, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({'detail': 'Post deleted successfully'}, status=status.HTTP_200_OK)


class PostImageAddView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id, is_active=True)
        
        if post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        if post.images.count() >= 20:
            return Response({'detail': 'Maximum 20 images allowed per post.'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ImageAddSerializer(data=request.data)
        if serializer.is_valid():
            images_data = serializer.validated_data['images']
            
            if post.images.count() + len(images_data) > 20:
                return Response({'detail': 'Maximum 20 images allowed per post.'}, status=status.HTTP_400_BAD_REQUEST)
            
            last_order = post.images.aggregate(max_order=models.Max('order'))['max_order'] or 0
            
            for i, image in enumerate(images_data, 1):
                PostImage.objects.create(post=post, image=image, order=last_order + i)
            
            return Response({'detail': 'Images added successfully'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostImageDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, post_id, img_id):
        post = get_object_or_404(Post, id=post_id, is_active=True)
        image = get_object_or_404(PostImage, id=img_id, post=post)
        
        if post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        deleted_order = image.order
        image.delete()
        
        # Compact remaining orders
        remaining_images = PostImage.objects.filter(post=post, order__gt=deleted_order).order_by('order')
        for i, img in enumerate(remaining_images, deleted_order):
            img.order = i
            img.save()
        
        return Response({'detail': 'Image deleted successfully'}, status=status.HTTP_200_OK)


class PostLikeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id, is_active=True)
        
        like, created = PostLike.objects.get_or_create(post=post, user=request.user)
        if not created:
            return Response({
                'detail': 'Post already liked',
                'likes_count': post.likes_count,
                'liked': True
            }, status=status.HTTP_409_CONFLICT)
        
        post.likes_count = models.F('likes_count') + 1
        post.save(update_fields=['likes_count'])
        post.refresh_from_db()
        
        return Response({
            'detail': 'Post liked',
            'likes_count': post.likes_count,
            'liked': True
        }, status=status.HTTP_201_CREATED)


class PostUnlikeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id, is_active=True)
        
        try:
            like = PostLike.objects.get(post=post, user=request.user)
            like.delete()
            post.likes_count = models.F('likes_count') - 1
            post.save(update_fields=['likes_count'])
            post.refresh_from_db()
            
            return Response({
                'detail': 'Post unliked',
                'likes_count': post.likes_count,
                'liked': False
            }, status=status.HTTP_200_OK)
        except PostLike.DoesNotExist:
            return Response({
                'detail': 'Post not liked',
                'likes_count': post.likes_count,
                'liked': False
            }, status=status.HTTP_404_NOT_FOUND)


class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = PostCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return PostComment.objects.filter(post_id=post_id, is_active=True).select_related('user')
    
    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id, is_active=True)
        comment = serializer.save(user=self.request.user, post=post)
        
        # Update comment count
        post.comments_count = models.F('comments_count') + 1
        post.save(update_fields=['comments_count'])
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'total_count': queryset.count(),
            'results': serializer.data
        })


class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, comment_id):
        comment = get_object_or_404(PostComment, id=comment_id, is_active=True)
        
        # Allow comment author, post author, or staff to delete comments
        if comment.user != request.user and comment.post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        comment.is_active = False
        comment.save()
        
        # Update comment count
        post = comment.post
        post.comments_count = models.F('comments_count') - 1
        post.save(update_fields=['comments_count'])
        
        return Response({'detail': 'Comment deleted successfully'}, status=status.HTTP_200_OK)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get users that are following the current user (followers)
        from home.models import Follow
        follower_ids = Follow.objects.filter(
            following=request.user, 
            status='accepted'
        ).values_list('follower_id', flat=True)
        
        users = User.objects.filter(id__in=follower_ids, is_active=True)
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)


class PostShareView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id, is_active=True)
        recipient_ids = request.data.get('recipients', [])
        
        if not recipient_ids:
            return Response({'detail': 'No recipients selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        shared_count = 0
        for recipient_id in recipient_ids:
            try:
                recipient = User.objects.get(id=recipient_id)
                share, created = PostShare.objects.get_or_create(
                    post=post, sender=request.user, recipient=recipient
                )
                if created:
                    # Create notification
                    Notification.objects.create(
                        recipient=recipient,
                        sender=request.user,
                        notification_type='post',
                        message=f'{request.user.first_name} {request.user.last_name} shared a post with you',
                        object_id=post.id
                    )
                    shared_count += 1
            except User.DoesNotExist:
                continue
        
        return Response({
            'detail': f'Post shared with {shared_count} users',
            'shared_count': shared_count
        }, status=status.HTTP_200_OK)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user)
        # Simple serialization since we're not using the NotificationSerializer
        data = [{
            'id': str(n.id),
            'sender_name': f'{n.sender.first_name} {n.sender.last_name}' if n.sender else 'System',
            'message': n.message,
            'notification_type': n.notification_type,
            'is_read': n.is_read,
            'created_at': n.created_at,
            'object_id': str(n.object_id) if n.object_id else None
        } for n in notifications]
        return Response(data)


