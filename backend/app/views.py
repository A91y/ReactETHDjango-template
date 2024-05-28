import json
import uuid
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from web3 import Web3
from eth_account.messages import encode_defunct
from .models import Blog, Profile
from .decorators import require_authentication


def generate_message(request):
    message = f"Login request: {uuid.uuid4()}"
    request.session['login_message'] = message
    return JsonResponse({'message': message})


@csrf_exempt
@require_authentication
def create_blog(request):
    if request.method == 'POST':
        raw_data = request.body
        body_unicode = raw_data.decode('utf-8')
        body = json.loads(body_unicode)
        title = body['title']
        content = body['content']
        user_address = request.user_address
        if not title or not content or title.strip() == '' or content.strip() == '':
            return JsonResponse({'error': 'Title and content are required.'}, status=400)
        author = Profile.objects.get(user_address=user_address)
        blog = Blog.objects.create(title=title, content=content, author=author)
        print("--------------------------")
        return JsonResponse({'id': blog.id, 'title': blog.title, 'content': blog.content, 'author': blog.author.user_address, 'author_name': blog.author.name})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)


def list_blogs(request):
    blogs = Blog.objects.all()
    return JsonResponse({'blogs': [{'id': blog.id, 'title': blog.title, 'content': blog.content, 'author': blog.author.user_address} for blog in blogs]})
