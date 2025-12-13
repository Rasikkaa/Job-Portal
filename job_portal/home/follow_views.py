from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from authentication.models import User
from .follow_models import Follow
from .follow_serializers import UserMinimalSerializer

class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        follower = request.user
        following = get_object_or_404(User, id=user_id)
        
        # No self-follow
        if follower == following:
            return Response({'detail': 'You cannot follow yourself.'}, status=400)
        
        # Role validation
        if follower.job_role == 'company' and following.job_role != 'company':
            return Response({'detail': 'Companies can only follow other companies.'}, status=403)
        elif follower.job_role == 'employee' and following.job_role == 'employee':
            return Response({'detail': 'Employees cannot follow other employees.'}, status=403)
        
        # Check existing follow
        if Follow.objects.filter(follower=follower, following=following).exists():
            return Response({'detail': 'Already following this user.'}, status=409)
        
        # Create follow
        Follow.objects.create(follower=follower, following=following)
        return Response({'detail': 'Following created'}, status=201)

class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        follower = request.user
        following = get_object_or_404(User, id=user_id)
        
        follow = Follow.objects.filter(follower=follower, following=following).first()
        if not follow:
            return Response({'detail': 'Not following this user.'}, status=404)
        
        follow.delete()
        return Response({'detail': 'Unfollowed'}, status=200)

class FollowersListView(generics.ListAPIView):
    serializer_class = UserMinimalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        follows = Follow.objects.filter(following_id=user_id)
        return User.objects.filter(id__in=follows.values_list('follower_id', flat=True))
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'total_count': queryset.count(),
            'results': serializer.data
        })

class FollowingListView(generics.ListAPIView):
    serializer_class = UserMinimalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        follows = Follow.objects.filter(follower_id=user_id)
        return User.objects.filter(id__in=follows.values_list('following_id', flat=True))
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'total_count': queryset.count(),
            'results': serializer.data
        })

class FollowCountsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        followers_count = Follow.objects.filter(following_id=user_id).count()
        following_count = Follow.objects.filter(follower_id=user_id).count()
        
        data = {
            'followers': followers_count,
            'following': following_count
        }
        
        return Response(data)