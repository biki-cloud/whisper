from django.contrib import admin
from .models import Post, EmotionTag

@admin.register(EmotionTag)
class EmotionTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'content', 'emotion_tag', 'empathy_count', 'created_at']
    list_filter = ['emotion_tag', 'created_at']
    search_fields = ['content']
    readonly_fields = ['empathy_count', 'created_at']
