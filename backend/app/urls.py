# urls.py
from django.urls import path
from .views import generate_message, verify_signature, create_blog, list_blogs, update_blog, delete_blog, test_view
from .token_views import TokenCreateView, TokenVerifyView
urlpatterns = [
    path('generate-message/', generate_message, name='generate_message'),
    path('verify-signature/', verify_signature, name='verify_signature'),
    path('blogs/', list_blogs, name='list_blogs'),
    path('blogs/create/', create_blog, name='create_blog'),
    path('blogs/update/<int:blog_id>/', update_blog, name='update_blog'),
    path('blogs/delete/<int:blog_id>/', delete_blog, name='delete_blog'),
    path('token/create/', TokenCreateView.as_view(), name='token_create'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('test/', test_view),

]
