from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import UserProfile, CompanyProfile
from .serializer import UserProfileSerializer, CompanyProfileSerializer
from .permissions import IsCompany, IsEmployeeOrEmployer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.job_role == 'company':
            profile, created = CompanyProfile.objects.get_or_create(user=user)
            serializer = CompanyProfileSerializer(profile, context={'request': request})
        else:
            profile, created = UserProfile.objects.get_or_create(user=user)
            serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        if user.job_role == 'company':
            profile, created = CompanyProfile.objects.get_or_create(user=user)
            serializer = CompanyProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        else:
            profile, created = UserProfile.objects.get_or_create(user=user)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Profile updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Profile updated successfully.'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid data provided.'}, status=status.HTTP_400_BAD_REQUEST)

class CompanyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = CompanyProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Profile updated successfully.'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid data provided.'}, status=status.HTTP_400_BAD_REQUEST)