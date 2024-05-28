import jwt
from django.http import JsonResponse
from django.conf import settings
from functools import wraps
from datetime import datetime
def require_authentication(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Check for the Authorization header
        auth_header = request.headers.get('Authorization', None)
        if auth_header:
            try:
                # Split the authorization header to extract the token
                token = auth_header.split(' ')[1]

                # Decode and verify the token using the secret key
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

                # Attach the decoded token data to the request object
                request.user_address = decoded_token.get('address')

                # Check if the token has expired
                if decoded_token.get('expiry_time') < datetime.now().timestamp():
                    return JsonResponse({'error': 'Token expired'}, status=401)

            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
        else:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        return view_func(request, *args, **kwargs)

    return wrapper
