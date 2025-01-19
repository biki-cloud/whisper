from django.db import migrations

def create_initial_emotion_tags(apps, schema_editor):
    EmotionTag = apps.get_model('posts', 'EmotionTag')
    tags = [
        '安心', '悲しい', '嬉しい', '怒り', '不安',
        '期待', '驚き', '恐れ', '穏やか', '寂しい',
        '感謝', '後悔', '誇り', '焦り', '困惑'
    ]
    for tag_name in tags:
        EmotionTag.objects.create(name=tag_name)

def remove_initial_emotion_tags(apps, schema_editor):
    EmotionTag = apps.get_model('posts', 'EmotionTag')
    EmotionTag.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('posts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_emotion_tags, remove_initial_emotion_tags),
    ] 