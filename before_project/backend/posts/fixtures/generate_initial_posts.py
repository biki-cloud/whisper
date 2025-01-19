import json
from datetime import datetime, timezone

posts = [
    {
        "model": "posts.post",
        "pk": 1,
        "fields": {
            "content": "今日は素晴らしい一日でした！新しい友達ができて、とても嬉しいです。",
            "emotion_tag": 3,
            "empathy_count": 5,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "ip_address": "127.0.0.1"
        }
    },
    {
        "model": "posts.post",
        "pk": 2,
        "fields": {
            "content": "大切なものをなくしてしまいました。心が重いです。",
            "emotion_tag": 2,
            "empathy_count": 3,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "ip_address": "127.0.0.2"
        }
    },
    {
        "model": "posts.post",
        "pk": 3,
        "fields": {
            "content": "電車でマナーの悪い人を見かけて、イライラしました。",
            "emotion_tag": 4,
            "empathy_count": 4,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "ip_address": "127.0.0.3"
        }
    }
]

with open('initial_posts.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, ensure_ascii=False, indent=2) 