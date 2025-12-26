from django.urls import path
from .views import (
    PostListCreateView, PostDetailView, PostImageAddView, PostImageDeleteView, 
    PostLikeView, PostUnlikeView, PostCommentListCreateView, CommentDeleteView
)

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:post_id>/images/', PostImageAddView.as_view(), name='post-image-add'),
    path('posts/<int:post_id>/images/<int:img_id>/', PostImageDeleteView.as_view(), name='post-image-delete'),
    path('posts/<int:post_id>/like/', PostLikeView.as_view(), name='post-like'),
    path('posts/<int:post_id>/unlike/', PostUnlikeView.as_view(), name='post-unlike'),
    path('posts/<int:post_id>/comments/', PostCommentListCreateView.as_view(), name='post-comments'),
    path('comments/<int:comment_id>/', CommentDeleteView.as_view(), name='comment-delete'),
]