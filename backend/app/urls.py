from django.urls import path
from .views import generate_message, create_blog, list_blogs
from .token_views import TokenCreateView, TokenVerifyView

urlpatterns = [
    path('generate-message/', generate_message, name='generate_message'),
    path('blogs/', list_blogs, name='list_blogs'),
    path('blogs/create/', create_blog, name='create_blog'),
    path('token/create/', TokenCreateView.as_view(), name='token_create'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
