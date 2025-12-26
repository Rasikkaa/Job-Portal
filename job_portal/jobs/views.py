from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import datetime
from .serializer import *
from .models import Job, Application
from home.models import UserProfile
from .permissions import IsPublisherRole, IsPublisherOrOwner, IsEmployee, IsJobPublisher, IsApplicantOrPublisher


class JobListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'requirments', 'experience', 'work_mode', 'publisher__first_name', 'publisher__last_name']
    ordering_fields = ['created_at', 'title', 'job_type', 'experience', 'work_mode', 'count']
    ordering = ['-created_at']
    serializer_class = JobDetailSerializer

    def get_queryset(self):
        return Job.objects.filter(is_active=True).select_related('publisher')

class JobCreateView(generics.CreateAPIView):
    serializer_class = JobDetailSerializer
    permission_classes = [IsPublisherRole]

    def perform_create(self, serializer):
        serializer.save(publisher=self.request.user)

class JobStatsView(APIView):
    permission_classes = [IsAuthenticated, IsPublisherRole]
    
    def get(self, request):
        user_jobs = Job.objects.filter(publisher=request.user)
        total_jobs = user_jobs.count()
        active_jobs = user_jobs.filter(is_active=True).count()
        total_applications = Application.objects.filter(job__publisher=request.user).count()
        
        return Response({
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applications': total_applications
        })

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all().select_related('publisher')
    serializer_class = JobDetailSerializer
    permission_classes = [IsPublisherOrOwner]

    def perform_destroy(self, instance):
        instance.delete()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Job updated successfully.'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid data provided.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'detail': 'Job deleted successfully.'}, status=status.HTTP_200_OK)

class MyJobsView(generics.ListAPIView):
    serializer_class = JobDetailSerializer
    permission_classes = [IsAuthenticated, IsPublisherRole]
    
    def get_queryset(self):
        return Job.objects.filter(publisher=self.request.user).select_related('publisher').order_by('-created_at')

class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, is_active=True)
        except Job.DoesNotExist:
            return Response({'detail': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if job.publisher == request.user:
            return Response({'detail': 'Cannot apply to your own job posting'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Application.objects.filter(job=job, applicant=request.user).exists():
            return Response({'detail': 'Already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ApplicationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(job=job, applicant=request.user)
            job.count += 1
            job.save()
            return Response({'detail': 'Application submitted successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationListSerializer
    permission_classes = [IsAuthenticated, IsPublisherRole]
    
    def get_queryset(self):
        job_id = self.kwargs['job_id']
        try:
            job = Job.objects.get(id=job_id, publisher=self.request.user)
            queryset = Application.objects.filter(job=job)
            
            # Filter by status
            status = self.request.GET.get('status')
            if status:
                status_list = [s.strip() for s in status.split(',')]
                queryset = queryset.filter(status__in=status_list)
            
            # Filter by applicant
            applicant = self.request.GET.get('applicant')
            if applicant:
                queryset = queryset.filter(applicant_id=applicant)
            
            # Filter by date
            applied_after = self.request.GET.get('applied_after')
            if applied_after:
                queryset = queryset.filter(applied_at__date__gte=applied_after)
            
            # Ordering
            ordering = self.request.GET.get('ordering', '-applied_at')
            return queryset.order_by(ordering)
            
        except Job.DoesNotExist:
            return Application.objects.none()

class MyApplicationsView(generics.ListAPIView):
    serializer_class = MyApplicationSerializer
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def get_queryset(self):
        queryset = Application.objects.filter(applicant=self.request.user)
        
        # Filter by status
        status = self.request.GET.get('status')
        if status:
            status_list = [s.strip() for s in status.split(',')]
            queryset = queryset.filter(status__in=status_list)
        
        return queryset.order_by('-applied_at')

class ApplicationDetailView(generics.RetrieveUpdateAPIView):
    queryset = Application.objects.all()
    permission_classes = [IsAuthenticated, IsApplicantOrPublisher]
    
    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return ApplicationUpdateSerializer
        return ApplicationDetailSerializer
    
    def update(self, request, *args, **kwargs):
        application = self.get_object()
        if application.job.publisher != request.user:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

