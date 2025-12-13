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


class JobListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsPublisherRole]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'requirments', 'publisher__first_name', 'publisher__last_name']
    ordering_fields = ['created_at', 'title', 'job_type', 'count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobListSerializer
        return JobDetailSerializer

    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True).select_related('publisher')
        
        # Search functionality
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) | 
                Q(requirments__icontains=search)
            )
        
        # Custom filters
        title = self.request.GET.get('title')
        if title:
            queryset = queryset.filter(title__icontains=title)
        
        company = self.request.GET.get('company')
        if company:
            queryset = queryset.filter(
                Q(publisher__first_name__icontains=company) |
                Q(publisher__last_name__icontains=company) |
                Q(publisher__email__icontains=company)
            )
        
        location = self.request.GET.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        job_type = self.request.GET.get('job_type')
        if job_type:
            types = [t.strip() for t in job_type.split(',')]
            queryset = queryset.filter(job_type__in=types)
        
        posted_after = self.request.GET.get('posted_after')
        if posted_after:
            try:
                date = datetime.strptime(posted_after, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=date)
            except ValueError:
                pass
        
        posted_before = self.request.GET.get('posted_before')
        if posted_before:
            try:
                date = datetime.strptime(posted_before, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=date)
            except ValueError:
                pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        # Validate job_type
        job_type = request.GET.get('job_type')
        if job_type:
            valid_types = ['fulltime', 'parttime', 'intern']
            types = [t.strip() for t in job_type.split(',')]
            if not all(t in valid_types for t in types):
                return Response({'error': 'Invalid job_type. Use: fulltime, parttime, intern'}, status=400)
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'total_count': queryset.count(),
            'results': serializer.data
        })

    def perform_create(self, serializer):
        serializer.save(publisher=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'detail': 'Job created successfully.'}, status=status.HTTP_201_CREATED)
        return Response({'detail': 'Invalid data provided.'}, status=status.HTTP_400_BAD_REQUEST)

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
    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated, IsPublisherRole]
    
    def get_queryset(self):
        return Job.objects.filter(publisher=self.request.user, is_active=True).order_by('-created_at')

class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, is_active=True)
        except Job.DoesNotExist:
            return Response({'detail': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
        
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

