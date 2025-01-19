from rest_framework import serializers
from .models import Post, EmotionTag
from rest_framework.exceptions import Throttled
from django.utils import timezone

class EmotionTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionTag
        fields = ['id', 'name']

class PostSerializer(serializers.ModelSerializer):
    emotion_tag = EmotionTagSerializer(read_only=True)
    emotion_tag_id = serializers.PrimaryKeyRelatedField(
        queryset=EmotionTag.objects.all(),
        source='emotion_tag',
        write_only=True,
        required=False
    )

    class Meta:
        model = Post
        fields = ['id', 'content', 'emotion_tag', 'emotion_tag_id', 'empathy_count', 'created_at']
        read_only_fields = ['empathy_count', 'created_at']

    def validate(self, data):
        # IPアドレスの取得（viewsから渡される）
        ip_address = self.context.get('ip_address')
        if not ip_address:
            raise serializers.ValidationError("IP address is required")

        # 現在の日付の開始時刻（00:00:00）を取得
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        # 現在の日付の終了時刻（23:59:59）を取得
        today_end = today_start.replace(hour=23, minute=59, second=59, microsecond=999999)

        # 同じIPアドレスからの今日の投稿をチェック
        recent_post = Post.objects.filter(
            ip_address=ip_address,
            created_at__range=(today_start, today_end)
        ).first()

        if recent_post:
            # 次の日の00:00:00までの待ち時間を計算（エラーメッセージには含めない）
            raise Throttled(detail="今日はすでに投稿済みです。次の投稿は明日の0時以降に可能になります。")

        # IP アドレスをデータに追加
        data['ip_address'] = ip_address
        return data 