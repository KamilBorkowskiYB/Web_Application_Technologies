# Generated by Django 5.1.7 on 2025-05-28 09:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cinema_api', '0011_movieshowing_ticket_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='cancelled',
            field=models.BooleanField(default=False),
        ),
    ]
