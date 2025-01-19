import factory
from django.utils import timezone
from posts.models import Post, EmotionTag

class EmotionTagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = EmotionTag

    name = factory.Sequence(lambda n: f'感情{n}')

class PostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Post

    content = factory.Faker('text', max_nb_chars=200, locale='ja_JP')
    emotion_tag = factory.SubFactory(EmotionTagFactory)
    empathy_count = 0
    created_at = factory.LazyFunction(timezone.now)
    expires_at = factory.LazyAttribute(lambda obj: obj.created_at + timezone.timedelta(hours=24))
    ip_address = factory.Faker('ipv4') 