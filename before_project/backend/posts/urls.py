from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'emotion-tags', views.EmotionTagViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 