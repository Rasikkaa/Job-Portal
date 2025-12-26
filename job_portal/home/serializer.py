from rest_framework import serializers
from .models import UserProfile, CompanyProfile

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    email = serializers.CharField(source='user.email', read_only=True)
    job_role = serializers.CharField(source='user.job_role', read_only=True)
    id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'full_name', 'job_role', 'profile_image', 'phone', 'location', 'bio', 'skills', 'experience_years']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.profile_image:
            request = self.context.get('request')
            if request:
                data['profile_image'] = request.build_absolute_uri(instance.profile_image.url)
            else:
                data['profile_image'] = instance.profile_image.url
        return data
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only include company_name for employers
        if self.instance and self.instance.user.job_role == 'employer':
            self.fields['company_name'] = serializers.CharField(max_length=255, required=True)
        elif hasattr(self, 'context') and self.context.get('request'):
            user = self.context['request'].user
            if user.job_role == 'employer':
                self.fields['company_name'] = serializers.CharField(max_length=255, required=True)
    
    def validate(self, data):
        user = self.context['request'].user
        company_name = data.get('company_name')
        
        if company_name and user.job_role != 'employer':
            raise serializers.ValidationError({'company_name': 'Company name can only be set for employers.'})
        if not company_name and user.job_role == 'employer':
            raise serializers.ValidationError({'company_name': 'Company name is required for employers.'})
        
        return data
    
    def update(self, instance, validated_data):
        # Handle skills field properly
        if 'skills' in self.context['request'].data:
            skills_data = self.context['request'].data.get('skills')
            if isinstance(skills_data, str):
                import json
                try:
                    validated_data['skills'] = json.loads(skills_data)
                except json.JSONDecodeError:
                    validated_data['skills'] = []
        
        return super().update(instance, validated_data)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CompanyProfileSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    job_role = serializers.CharField(source='user.job_role', read_only=True)
    id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = CompanyProfile
        fields = ['id', 'email', 'job_role', 'company_logo', 'company_name', 'company_email', 'company_phone', 'company_website', 'company_address', 'company_description']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.company_logo:
            request = self.context.get('request')
            if request:
                data['company_logo'] = request.build_absolute_uri(instance.company_logo.url)
            else:
                data['company_logo'] = instance.company_logo.url
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)