# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0005_job_experience'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='work_mode',
            field=models.CharField(choices=[('remote', 'Remote'), ('hybrid', 'Hybrid'), ('onsite', 'On-site')], db_index=True, default='onsite', max_length=20),
        ),
    ]