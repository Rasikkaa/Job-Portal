from rest_framework import serializers
from authentication.models import User
from .models import Job, Application
from home.models import UserProfile


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'job_role')


class JobListSerializer(serializers.ModelSerializer):
    publisher_name = serializers.SerializerMethodField()
    publisher_job_role = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ('id', 'title', 'publisher_name', 'publisher_job_role', 'company_name', 'job_type', 'experience', 'work_mode', 'created_at','count')

    def get_publisher_name(self, obj):
        return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip() or obj.publisher.email

    def get_publisher_job_role(self, obj):
        return obj.publisher.job_role
    
    def get_company_name(self, obj):
        if obj.publisher.job_role == 'employer':
            try:
                return obj.publisher.userprofile.company_name
            except:
                return None
        elif obj.publisher.job_role == 'company':
            return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip()
        return None

class JobDetailSerializer(serializers.ModelSerializer):
    publisher = UserPublicSerializer(read_only=True)
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ('id', 'title', 'description', 'requirments', 'location', 'salary', 'job_type', 'experience', 'work_mode', 'publisher', 'company_name', 'created_at', 'updated_at', 'is_active', 'count')
        read_only_fields = ('publisher', 'created_at', 'updated_at', 'count')
    
    def get_company_name(self, obj):
        if obj.publisher.job_role == 'employer':
            try:
                return obj.publisher.userprofile.company_name
            except:
                return None
        elif obj.publisher.job_role == 'company':
            return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip()
        return None

class UserJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('skills', 'experience_years', 'address')

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('resume', 'cover_text')

class ApplicantSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    experience_years = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'job_role', 'profile_image', 'phone', 'location', 'bio', 'skills', 'experience_years')
    
    def get_profile_image(self, obj):
        try:
            return obj.userprofile.profile_image.url if obj.userprofile.profile_image else None
        except:
            return None
    
    def get_phone(self, obj):
        try:
            return obj.userprofile.phone
        except:
            return None
    
    def get_location(self, obj):
        try:
            return obj.userprofile.location
        except:
            return None
    
    def get_bio(self, obj):
        try:
            return obj.userprofile.bio
        except:
            return None
    
    def get_skills(self, obj):
        try:
            return obj.userprofile.skills
        except:
            return []
    
    def get_experience_years(self, obj):
        try:
            return obj.userprofile.experience_years
        except:
            return None

class JobSummarySerializer(serializers.ModelSerializer):
    publisher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = ('id', 'title', 'publisher_name')
    
    def get_publisher_name(self, obj):
        return f"{obj.publisher.first_name} {obj.publisher.last_name}".strip() or obj.publisher.email

class ApplicationListSerializer(serializers.ModelSerializer):
    applicant = ApplicantSerializer(read_only=True)
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ('id', 'applicant', 'resume_url', 'cover_text', 'status', 'applied_at')
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None

class MyApplicationSerializer(serializers.ModelSerializer):
    job = JobSummarySerializer(read_only=True)
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ('id', 'job', 'status', 'applied_at', 'resume_url', 'cover_text')
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None

class ApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('status', 'review_notes')

class ApplicationDetailSerializer(serializers.ModelSerializer):
    applicant = ApplicantSerializer(read_only=True)
    job = JobSummarySerializer(read_only=True)
    resume_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ('id', 'job', 'applicant', 'resume_url', 'cover_text', 'status', 'review_notes', 'applied_at', 'updated_at')
    
    def get_resume_url(self, obj):
        return obj.resume.url if obj.resume else None