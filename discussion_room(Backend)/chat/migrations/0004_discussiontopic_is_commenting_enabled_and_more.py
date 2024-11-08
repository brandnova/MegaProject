# Generated by Django 5.1.1 on 2024-11-08 13:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_alter_discussiontopic_options_alter_message_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='discussiontopic',
            name='is_commenting_enabled',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='message',
            name='modified_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
