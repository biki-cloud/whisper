from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Post, EmotionTag
from .serializers import PostSerializer, EmotionTagSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
import random
import logging

logger = logging.getLogger(__name__)

class LoggingMixin:
    def initial(self, request, *args, **kwargs):
        logger.info(f"------------------------------")
        logger.info(f"Request URL   : {request.path}")
        logger.info(f"Request Method: {request.method}")
        logger.info(f"Request Body  : {request.data}")
        return super().initial(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        logger.info(f"Response Code : {response.status_code}")
        logger.info(f"Response Body : {response.data if hasattr(response, 'data') else 'No data'}")
        logger.info(f"------------------------------")
        return response

@extend_schema_view(
    list=extend_schema(
        summary="投稿一覧の取得",
        description="有効期限内の投稿一覧を取得します。",
    ),
    create=extend_schema(
        summary="新規投稿の作成",
        description="新しい投稿を作成します。1つのIPアドレスからは24時間に1回のみ投稿できます。",
    ),
    random=extend_schema(
        summary="ランダムな投稿の取得",
        description="有効期限内の投稿からランダムに指定された件数（デフォルト10件、最大50件）を取得します。",
        parameters=[
            OpenApiParameter(
                name="count",
                type=int,
                location=OpenApiParameter.QUERY,
                description="取得する投稿の件数（デフォルト: 10, 最大: 50）",
                required=False,
            ),
        ],
    ),
    empathy=extend_schema(
        summary="投稿への共感",
        description="指定された投稿の共感カウントを1増やします。",
    ),
)
class PostViewSet(LoggingMixin, viewsets.ModelViewSet):
    serializer_class = PostSerializer

    def get_queryset(self):
        today = timezone.now().date()
        tomorrow = today + timezone.timedelta(days=1)
        return Post.objects.filter(created_at__date=today)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['ip_address'] = self.request.META.get('REMOTE_ADDR')
        return context

    @action(detail=False, methods=['get'])
    def random(self, request):
        valid_posts = self.get_queryset()
        
        try:
            count = int(request.query_params.get('count', 10))
            count = min(max(1, count), 50)
        except ValueError:
            count = 10

        count = min(valid_posts.count(), count)
        if count == 0:
            return Response([])
        
        random_posts = random.sample(list(valid_posts), count)
        serializer = self.get_serializer(random_posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def empathy(self, request, pk=None):
        post = self.get_object()
        post.empathy_count += 1
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)

@extend_schema_view(
    list=extend_schema(
        summary="感情タグ一覧の取得",
        description="利用可能な感情タグの一覧を取得します。",
    ),
)
class EmotionTagViewSet(LoggingMixin, viewsets.ReadOnlyModelViewSet):
    queryset = EmotionTag.objects.all()
    serializer_class = EmotionTagSerializer
