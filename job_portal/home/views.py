from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import UserProfile, CompanyProfile
from .serializer import UserProfileSerializer, CompanyProfileSerializer
from .permissions import IsCompany, IsEmployeeOrEmployer
import os

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

class DeleteProfileImageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        if user.job_role == 'company':
            profile, created = CompanyProfile.objects.get_or_create(user=user)
            if profile.company_logo:
                if os.path.isfile(profile.company_logo.path):
                    os.remove(profile.company_logo.path)
                profile.company_logo = None
                profile.save()
                return Response({'detail': 'Company logo deleted successfully.'}, status=status.HTTP_200_OK)
            return Response({'detail': 'No company logo to delete.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            profile, created = UserProfile.objects.get_or_create(user=user)
            if profile.profile_image:
                if os.path.isfile(profile.profile_image.path):
                    os.remove(profile.profile_image.path)
                profile.profile_image = None
                profile.save()
                return Response({'detail': 'Profile image deleted successfully.'}, status=status.HTTP_200_OK)
            return Response({'detail': 'No profile image to delete.'}, status=status.HTTP_400_BAD_REQUEST)

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