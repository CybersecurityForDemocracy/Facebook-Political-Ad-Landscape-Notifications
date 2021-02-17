"""Module for shared authentication logic and constants."""
import enum
import os
import time

from authlib.integrations.flask_client import OAuth
from flask_login import UserMixin

COGNITO_ACCESS_TOKEN_URL_TEMPLATE = 'https://%s/oauth2/token'
COGNITO_LOGIN_URL_TEMPLATE = 'https://%s/login'
COGNITO_USERINFO_URL_TEMPLATE = 'https://%s/oauth2/userInfo'

AD_SCREENER_COGNITO_HOST = os.environ['AD_SCREENER_OAUTH_IDENTITY_PROVIDER_HOST']
AD_SCREENER_COGNITO_ACCESS_TOKEN_URL = COGNITO_ACCESS_TOKEN_URL_TEMPLATE % AD_SCREENER_COGNITO_HOST
AD_SCREENER_COGNITO_LOGIN_URL = COGNITO_LOGIN_URL_TEMPLATE % AD_SCREENER_COGNITO_HOST
AD_SCREENER_COGNITO_USERINFO_URL = COGNITO_USERINFO_URL_TEMPLATE % AD_SCREENER_COGNITO_HOST

AD_OBSERVATORY_COGNITO_HOST = os.environ['AD_OBSERVATORY_OAUTH_IDENTITY_PROVIDER_HOST']
AD_OBSERVATORY_COGNITO_ACCESS_TOKEN_URL = (
    COGNITO_ACCESS_TOKEN_URL_TEMPLATE % AD_OBSERVATORY_COGNITO_HOST)
AD_OBSERVATORY_COGNITO_LOGIN_URL = COGNITO_LOGIN_URL_TEMPLATE % AD_OBSERVATORY_COGNITO_HOST
AD_OBSERVATORY_COGNITO_USERINFO_URL = COGNITO_USERINFO_URL_TEMPLATE % AD_OBSERVATORY_COGNITO_HOST

# TODO(macpd): centralize setting and use.
AD_SCREENER_OAUTH_REDIRECT_URL = os.environ['AD_SCREENER_OAUTH_REDIRECT_URL']
AD_OBSERVATORY_OAUTH_REDIRECT_URL = os.environ['AD_OBSERVATORY_OAUTH_REDIRECT_URL']
AD_OBSERVATORY_AUTHORIZATION_SUCCESS_REDIRECT_URL = (
    os.environ['AD_OBSERVATORY_AUTHORIZATION_SUCCESS_REDIRECT_URL'])

AD_SCREENER_OAUTH_CLIENT_NAME = 'ad_screener_cognito'
AD_OBSERVATORY_OAUTH_CLIENT_NAME = 'ad_observatory_cognito'

oauth = OAuth()

oauth.register(
    name=AD_SCREENER_OAUTH_CLIENT_NAME,
    client_id=os.environ['AD_SCREENER_OAUTH_CLIENT_ID'],
    client_secret=os.environ['AD_SCREENER_OAUTH_CLIENT_SECRET'],
    access_token_url=AD_SCREENER_COGNITO_ACCESS_TOKEN_URL,
    access_token_params={'grant_type': 'authorization_code',
                         'client_id': os.environ['AD_SCREENER_OAUTH_CLIENT_ID'],
                         'redirect_uri': AD_SCREENER_OAUTH_REDIRECT_URL,
                         'scope': 'aws.cognito.signin.user.admin email openid profile'},
    authorize_url=AD_SCREENER_COGNITO_LOGIN_URL,
    authorize_params={'redirect_uri': AD_SCREENER_OAUTH_REDIRECT_URL,
                      'scope': 'aws.cognito.signin.user.admin email openid profile'},
    userinfo_endpoint=AD_SCREENER_COGNITO_USERINFO_URL,
    client_kwargs={'token_endpoint_auth_method': 'client_secret_basic',
                   'token_placement': 'header'})
oauth.register(
    name=AD_OBSERVATORY_OAUTH_CLIENT_NAME,
    client_id=os.environ['AD_OBSERVATORY_OAUTH_CLIENT_ID'],
    client_secret=os.environ['AD_OBSERVATORY_OAUTH_CLIENT_SECRET'],
    access_token_url=AD_OBSERVATORY_COGNITO_ACCESS_TOKEN_URL,
    access_token_params={'grant_type': 'authorization_code',
                         'client_id': os.environ['AD_OBSERVATORY_OAUTH_CLIENT_ID'],
                         'redirect_uri': AD_OBSERVATORY_OAUTH_REDIRECT_URL,
                         'scope': 'aws.cognito.signin.user.admin email openid profile'},
    authorize_url=AD_OBSERVATORY_COGNITO_LOGIN_URL,
    authorize_params={'redirect_uri': AD_OBSERVATORY_OAUTH_REDIRECT_URL,
                      'scope': 'aws.cognito.signin.user.admin email openid profile'},
    userinfo_endpoint=AD_OBSERVATORY_COGNITO_USERINFO_URL,
    client_kwargs={'token_endpoint_auth_method': 'client_secret_basic',
                   'token_placement': 'header'})

@enum.unique
class UserSystemType(enum.IntEnum):
    UNKNOWN = 0
    AD_SCREENER = 1
    AD_OBSERVATORY = 2


class User(UserMixin):
    def __init__(self, user_id, username, expires_at, access_token, refresh_token,
                 user_system_type):
        self._id = user_id
        self._username = username
        self._expires_at = float(expires_at)
        self._access_token = access_token
        self._refresh_token = refresh_token
        self._user_system_type = user_system_type

    def __str__(self):
        return ('ID: {id} username: {username} is_authenticated: {is_authenticated} '
                'expires_at: {expires_at} user_system_type: {user_system_type}').format(
                    id=self._id, username=self._username, is_authenticated=self.is_authenticated,
                    expires_at=self._expires_at, user_system_type=self._user_system_type)

    def get_id(self):
        return self._id

    @property
    def is_authenticated(self):
        return self._expires_at > time.time()

    @property
    def access_token(self):
        return self._access_token

    @property
    def user_system_type(self):
        return self._user_system_type

    @property
    def is_ad_screener_user(self):
        return self._user_system_type == UserSystemType.AD_SCREENER

    @property
    def is_ad_observatory_user(self):
        return self._user_system_type == UserSystemType.AD_OBSERVATORY
