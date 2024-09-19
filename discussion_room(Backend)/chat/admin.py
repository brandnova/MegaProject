from django.contrib import admin
from .models import UserProfile, DiscussionTopic, Message

# Register your models here.

admin.site.register(UserProfile)
admin.site.register(DiscussionTopic)
admin.site.register(Message)