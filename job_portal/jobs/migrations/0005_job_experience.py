# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0004_job_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='experience',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]