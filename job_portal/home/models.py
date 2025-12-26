from django.db import models
from django.core.exceptions import ValidationError
from authentication.models import User
from .follow_models import Follow

# Profile for Employee & Employer (shared)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Shared fields
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    # Employee/Employer specific fields
    skills = models.JSONField(default=list, blank=True)  
    experience_years = models.IntegerField(null=True, blank=True)
    company_name = models.CharField(max_length=255, null=True, blank=True, help_text="Only for employers")

    def clean(self):
        super().clean()
        # Validate company_name is only for employers
        if self.company_name and self.user.job_role != 'employer':
            raise ValidationError({'company_name': 'Company name can only be set for employers.'})
        if not self.company_name and self.user.job_role == 'employer':
            raise ValidationError({'company_name': 'Company name is required for employers.'})
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}"
    
    def __str__(self):
        return f"{self.full_name} Profile"

# Profile for Company only
class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    company_logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    company_name = models.CharField(max_length=255)
    company_email = models.EmailField(null=True, blank=True)  # Optional, will use user.email if not provided
    company_phone = models.CharField(max_length=20)
    company_website = models.URLField(null=True, blank=True)
    company_address = models.CharField(max_length=255)
    company_description = models.TextField(null=True, blank=True)
    
    @property
    def email(self):
        return self.company_email or self.user.email
    
    def str(self):
        return self.company_name