# Generated by Django 5.1.7 on 2025-05-17 09:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cinema_api', '0010_ticketdiscount_ticket_discount'),
    ]

    operations = [
        migrations.AddField(
            model_name='movieshowing',
            name='ticket_price',
            field=models.FloatField(default=25.0),
            preserve_default=False,
        ),
    ]
