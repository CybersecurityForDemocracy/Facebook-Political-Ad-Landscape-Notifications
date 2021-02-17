from django.utils import timezone
from django.contrib.auth import logout

from rest_framework import views
from rest_framework import permissions
from rest_framework import response
from allauth.socialaccount.providers.amazon_cognito.views import AmazonCognitoOAuth2Adapter
from rest_auth.registration.views import SocialLoginView


class AmazonCognitoLogin(SocialLoginView):
    adapter_class = AmazonCognitoOAuth2Adapter


class UserCognitoInformation(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        is_authenticated = request.user.is_authenticated
        email = None
        access_token = None
        username = None

        if is_authenticated:
            social_account = self.request.user.socialaccount_set.filter(provider='amazon_cognito').first()

            if social_account:
                social_token = social_account.socialtoken_set.filter(expires_at__gte=timezone.now()).first()
                if social_token:
                    access_token = social_token.token
                    email = request.user.email
                    username = request.user.username
                else:
                    logout(request)
                    is_authenticated = False

        return response.Response(
            {
                'is_authenticated': is_authenticated,
                'email': email,
                'access_token': access_token,
                'username': username
            }
        )
