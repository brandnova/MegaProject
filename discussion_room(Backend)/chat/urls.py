from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiscussionTopicViewSet, MessageViewSet, AuthViewSet

router = DefaultRouter()
router.register(r'topics', DiscussionTopicViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
]