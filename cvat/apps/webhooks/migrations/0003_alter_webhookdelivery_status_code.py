# Generated by Django 3.2.15 on 2022-10-11 09:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("webhooks", "0002_alter_webhookdelivery_status_code"),
    ]

    operations = [
        migrations.AlterField(
            model_name="webhookdelivery",
            name="status_code",
            field=models.PositiveIntegerField(default=None, null=True),
        ),
    ]
