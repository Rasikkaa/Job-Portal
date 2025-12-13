from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from .models import Post, PostComment
from .comment_serializers import PostCommentSerializer, CommentCreateSerializer
from .permissions import IsAuthorOrReadOnly


class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = PostCommentSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return PostComment.objects.filter(post_id=post_id, is_active=True).select_related('user')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return PostCommentSerializer
    
    def create(self, request, *args, **kwargs):
        post = get_object_or_404(Post, id=self.kwargs['post_id'], is_active=True)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            comment = serializer.save(post=post, user=request.user)
            Post.objects.filter(id=post.id).update(comments_count=models.F('comments_count') + 1)
        
        response_serializer = PostCommentSerializer(comment, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'comments_count': queryset.count(),
            'results': serializer.data
        })


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PostComment.objects.filter(is_active=True)
    serializer_class = PostCommentSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return CommentCreateSerializer
        return PostCommentSerializer
    
    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        response_serializer = PostCommentSerializer(comment, context={'request': request})
        return Response(response_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        
        # Allow deletion if user is comment author, post author, or staff
        if not (comment.user == request.user or comment.post.author == request.user or request.user.is_staff):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        with transaction.atomic():
            comment.is_active = False
            comment.save()
            Post.objects.filter(id=comment.post.id).update(comments_count=models.F('comments_count') - 1)
        
        return Response({'detail': 'Comment deleted'}, status=status.HTTP_200_OK)