from django.db import models
from django.utils import timezone
from datetime import timedelta

class EmotionTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Post(models.Model):
    content = models.TextField(max_length=1000)
    emotion_tag = models.ForeignKey(EmotionTag, on_delete=models.SET_NULL, null=True, related_name='posts')
    empathy_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()  # 1日1回制限のために使用

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['ip_address']),
        ]

    def __str__(self):
        return f"Post {self.id} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
