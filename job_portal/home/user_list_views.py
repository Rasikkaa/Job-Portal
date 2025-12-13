from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from authentication.models import User
from .follow_serializers import UserListSerializer

class AllUsersListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]