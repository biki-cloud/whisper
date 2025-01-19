import pytest
from django.utils import timezone
from posts.serializers import PostSerializer, EmotionTagSerializer
from .factories import PostFactory, EmotionTagFactory

@pytest.mark.django_db
class TestEmotionTagSerializer:
    def test_serialization(self):
        tag = EmotionTagFactory()
        serializer = EmotionTagSerializer(tag)
        
        assert serializer.data["id"] == tag.id
        assert serializer.data["name"] == tag.name

@pytest.mark.django_db
class TestPostSerializer:
    def test_serialization(self):
        post = PostFactory()
        tag = EmotionTagFactory()
        post.emotion_tag = tag
        post.save()
        serializer = PostSerializer(post)
        
        assert serializer.data["id"] == post.id
        assert serializer.data["content"] == post.content
        assert serializer.data["empathy_count"] == post.empathy_count
        assert serializer.data["emotion_tag"]["id"] == tag.id

    def test_create_with_emotion_tag(self):
        tag = EmotionTagFactory()
        data = {
            "content": "テスト投稿",
            "emotion_tag_id": tag.id
        }
        
        serializer = PostSerializer(data=data, context={"ip_address": "127.0.0.1"})
        assert serializer.is_valid()
        
        post = serializer.save()
        assert post.content == "テスト投稿"
        assert post.emotion_tag == tag
        assert post.ip_address == "127.0.0.1"

    def test_validate_duplicate_ip_same_day(self):
        # 現在の日付の開始時刻を取得
        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 今日の投稿を作成
        PostFactory(
            ip_address="127.0.0.1",
            created_at=today.replace(hour=10)  # 10時に投稿
        )
        
        # 同じ日の別の時間に投稿を試みる
        tag = EmotionTagFactory()
        data = {
            "content": "テスト投稿",
            "emotion_tag_id": tag.id
        }
        
        serializer = PostSerializer(data=data, context={"ip_address": "127.0.0.1"})
        assert not serializer.is_valid()
        assert "今日はすでに投稿済みです" in str(serializer.errors)

    def test_validate_different_day(self):
        # 昨日の投稿を作成
        yesterday = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0) - timezone.timedelta(days=1)
        PostFactory(
            ip_address="127.0.0.1",
            created_at=yesterday.replace(hour=23)  # 昨日の23時に投稿
        )
        
        # 今日新しい投稿を試みる
        tag = EmotionTagFactory()
        data = {
            "content": "テスト投稿",
            "emotion_tag_id": tag.id
        }
        
        serializer = PostSerializer(data=data, context={"ip_address": "127.0.0.1"})
        assert serializer.is_valid()  # 昨日の投稿があっても、今日は投稿できる

    def test_validate_missing_ip(self):
        # IPアドレスを提供せずに投稿を試みる
        tag = EmotionTagFactory()
        data = {
            "content": "テスト投稿",
            "emotion_tag_id": tag.id
        }
        
        serializer = PostSerializer(data=data)  # contextにip_addressを含めない
        assert not serializer.is_valid()
        assert "IP address is required" in str(serializer.errors) 