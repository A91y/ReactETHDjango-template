import jwt
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
from eth_account.messages import encode_defunct
from web3 import Web3
from .models import Profile
from datetime import datetime, timedelta


class TokenCreateView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        try:
            # Get user data from request body
            data = json.loads(request.body)
            user_address = data.get('user_address')
            signature = data.get('signature')
            login_message = data.get('login_message')
            # Create payload for JWT token
            payload = {
                'address': user_address,
                'signature': signature,
                'login_message': login_message,
                'expiry_time': (datetime.now() + timedelta(days=1)).timestamp()
            }
            print(payload)
            encoded_message = encode_defunct(text=login_message)
            recovered_address = Web3().eth.account.recover_message(
                encoded_message, signature=signature)
            if recovered_address.lower() == user_address.lower():
                profile = Profile.objects.get_or_create(
                    user_address=user_address)[0]
            # Encode the payload with a secret key to create the JWT token
            try:
                jwt_token = jwt.encode(
                    payload, settings.SECRET_KEY, algorithm='HS256').decode('utf-8')
            except Exception as e:
                jwt_token = jwt.encode(
                    payload, settings.SECRET_KEY, algorithm='HS256')

            return JsonResponse({'token': jwt_token, 'profile': {
                'user_address': profile.user_address,
                'name': profile.name,
                'bio': profile.bio
            }, 'status': 'authenticated'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class TokenVerifyView(View):
    def post(self, request):
        try:
            body_unicode = request.body.decode('utf-8')
            # Extract token from request body
            body = json.loads(body_unicode)
            token = body['token']
            # Decode and verify the token using the secret key
            decoded_token = jwt.decode(
                token, settings.SECRET_KEY, algorithms=['HS256'])
            print(decoded_token)
            if (decoded_token["expiry_time"] > datetime.now().timestamp()):
                return JsonResponse({'message': 'Token is valid', 'status': 'authenticated'})
            # If the token is valid, return success message
            else:
                return JsonResponse({'error': 'Token expired'}, status=401)

        except jwt.ExpiredSignatureError:
            # Token is expired
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError:
            # Invalid token
            return JsonResponse({'error': 'Invalid token'}, status=401)


# {
#   "user_address": "0x537eb071548e59d73af8a4421f5ea65a8e160818",
#   "signature": "0x298ef9e7ab794f8965f62d6f03e00baae58c2f6c8f5aa951e95c9c9bfaf43f091cb793ce61d95368e74d4fbff372d249950f069f29043aa500de1d8e1a5bfc601b",
#   "login_message": "Login request: a4dd0791-5cd8-4d87-b688-f8e8e092ccd7"
# }
