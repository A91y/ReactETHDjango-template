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
def verify_signature(request):
    if request.method == 'POST':
        raw_data = request.body
        print("raw_data", raw_data)
        body_unicode = raw_data.decode('utf-8')
        print("body_unicode", body_unicode)
        body = json.loads(body_unicode)
        print("body", body)
        user_address = body['user_address']
        signature = body['signature']
        message = body['login_message']
        print(user_address, signature, message)

        if not message:
            return JsonResponse({'error': 'No message found.'}, status=400)

        encoded_message = encode_defunct(text=message)
        recovered_address = Web3().eth.account.recover_message(
            encoded_message, signature=signature)
        print(recovered_address.lower(), user_address.lower())
        if recovered_address.lower() == user_address.lower():
            request.session['user_address'] = user_address
            profile = Profile.objects.get_or_create(
                user_address=user_address, name="")[0]
            return JsonResponse({'status': 'authenticated', 'name': profile.name})
        else:
            return JsonResponse({'error': 'Authentication failed.'}, status=401)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

# def require_authentication(view_func):
#     def wrapper(request, *args, **kwargs):
#         if 'user_address' not in request.session:
#             return JsonResponse({'error': 'Unauthorized'}, status=401)
#         return view_func(request, *args, **kwargs)
#     return wrapper


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
        # author = request.session['user_address']
        author = Profile.objects.get(user_address=user_address)
        blog = Blog.objects.create(title=title, content=content, author=author)
        print("--------------------------")
        return JsonResponse({'id': blog.id, 'title': blog.title, 'content': blog.content, 'author': blog.author.user_address, 'author_name': blog.author.name})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)


def list_blogs(request):
    # blogs = Blog.objects.all().values('id', 'title', 'content', 'author')
    # print(list(blogs))
    # return JsonResponse(list(blogs), safe=False)
    blogs = Blog.objects.all()
    return JsonResponse({'blogs': [{'id': blog.id, 'title': blog.title, 'content': blog.content, 'author': blog.author.user_address} for blog in blogs]})


@csrf_exempt
@require_authentication
def update_blog(request, blog_id):
    blog = get_object_or_404(Blog, id=blog_id)
    if request.session['user_address'] != blog.author:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    if request.method == 'POST':
        blog.title = request.POST.get('title', blog.title)
        blog.content = request.POST.get('content', blog.content)
        blog.save()
        return JsonResponse({'id': blog.id, 'title': blog.title, 'content': blog.content, 'author': blog.author})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)


@csrf_exempt
@require_authentication
def delete_blog(request, blog_id):
    blog = get_object_or_404(Blog, id=blog_id)
    if request.session['user_address'] != blog.author:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    if request.method == 'POST':
        blog.delete()
        return JsonResponse({'status': 'deleted'})
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)


def test_view(request):
    return JsonResponse({"header": request.headers.get('Authorization', None)})
