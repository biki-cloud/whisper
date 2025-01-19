import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from posts.models import Post
from .factories import PostFactory, EmotionTagFactory

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
class TestPostAPI:
    def test_create_post(self, api_client):
        tag = EmotionTagFactory()
        url = reverse('post-list')
        data = {
            'content': 'テスト投稿',
            'emotion_tag_id': tag.id
        }
        
        response = api_client.post(url, data, REMOTE_ADDR='127.0.0.1')
        assert response.status_code == status.HTTP_201_CREATED
        assert Post.objects.count() == 1
        assert Post.objects.first().content == 'テスト投稿'

    def test_create_post_duplicate_ip(self, api_client):
        tag = EmotionTagFactory()
        PostFactory(ip_address='127.0.0.1')
        
        url = reverse('post-list')
        data = {
            'content': 'テスト投稿',
            'emotion_tag_id': tag.id
        }
        
        response = api_client.post(url, data, REMOTE_ADDR='127.0.0.1')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Post.objects.count() == 1

    def test_get_random_posts(self, api_client):
        # 投稿を5件作成
        posts = [PostFactory() for _ in range(5)]
        
        url = reverse('post-random')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) <= 10  # 最大10件
        assert len(response.data) == 5  # 有効な投稿がすべて返される

    def test_empathy(self, api_client):
        post = PostFactory()
        url = reverse('post-empathy', args=[post.id])
        
        response = api_client.post(url, REMOTE_ADDR='127.0.0.1')
        assert response.status_code == status.HTTP_200_OK
        
        post.refresh_from_db()
        assert post.empathy_count == 1

    def test_expired_post_not_returned(self, api_client):
        # 期限切れの投稿を作成
        PostFactory(expires_at=timezone.now() - timedelta(hours=1))
        
        url = reverse('post-random')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    def test_empathy_nonexistent_post(self, api_client):
        url = reverse('post-empathy', args=[999])  # 存在しないID
        
        response = api_client.post(url, REMOTE_ADDR='127.0.0.1')
        assert response.status_code == status.HTTP_404_NOT_FOUND
