import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'job_portal.settings')
django.setup()

from jobs.models import Job

# Update all job counts based on existing applications
for job in Job.objects.all():
    job.count = job.applications.count()
    job.save()
    print(f"Job '{job.title}' count updated to {job.count}")

print("All job counts updated!")