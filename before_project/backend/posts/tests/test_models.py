import pytest
from django.utils import timezone
from datetime import timedelta
from posts.models import Post, EmotionTag
from .factories import PostFactory, EmotionTagFactory

@pytest.mark.django_db
class TestEmotionTag:
    def test_str_representation(self):
        tag = EmotionTagFactory(name="喜び")
        assert str(tag) == "喜び"

@pytest.mark.django_db
class TestPost:
    def test_str_representation(self):
        post = PostFactory()
        expected = f"Post {post.id} ({post.created_at.strftime('%Y-%m-%d %H:%M')})"
        assert str(post) == expected

    def test_auto_set_expires_at(self):
        # expires_atを指定せずに投稿を作成
        post = PostFactory(expires_at=None)
        
        # expires_atが自動的に設定されることを確認
        assert post.expires_at is not None
        expected_expiry = post.created_at + timedelta(hours=24)
        assert abs((post.expires_at - expected_expiry).total_seconds()) < 1

    def test_manual_set_expires_at(self):
        # expires_atを明示的に指定
        expiry_time = timezone.now() + timedelta(hours=12)
        post = PostFactory(expires_at=expiry_time)
        
        # 指定した値が使用されることを確認
        assert post.expires_at == expiry_time 