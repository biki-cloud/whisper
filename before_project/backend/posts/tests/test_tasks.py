import pytest
from django.utils import timezone
from datetime import timedelta
from posts.tasks import delete_expired_posts
from .factories import PostFactory

@pytest.mark.django_db
class TestDeleteExpiredPosts:
    def test_delete_expired_posts(self):
        # 期限切れの投稿を作成
        expired_post = PostFactory(
            expires_at=timezone.now() - timedelta(hours=1)
        )
        
        # 有効な投稿を作成
        valid_post = PostFactory(
            expires_at=timezone.now() + timedelta(hours=1)
        )
        
        # タスクを実行
        delete_expired_posts()
        
        # 期限切れの投稿が削除されていることを確認
        from posts.models import Post
        assert not Post.objects.filter(id=expired_post.id).exists()
        
        # 有効な投稿は残っていることを確認
        assert Post.objects.filter(id=valid_post.id).exists() 