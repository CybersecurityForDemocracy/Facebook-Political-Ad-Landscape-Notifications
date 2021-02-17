"""poladstransparency_17744 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from allauth.account.views import confirm_email
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from users.api.v1.views import UserCognitoInformation

api_patterns = [
    path("api/v1/", include(("home.api.v1.urls", "home"), namespace="home")),
    path("api/v1/", include(("polads.api.v1.urls", "polads"), namespace="ad_observatory")),
    path("api/v1/user/access-token", UserCognitoInformation.as_view())
]
# swagger
schema_view = get_schema_view(
    openapi.Info(
        title="OnlineAdObservatory API",
        default_version="v1",
        description="API documentation for OnlineAdObservatory App",
    ),
    public=True,
    patterns=api_patterns
)


urlpatterns = api_patterns
urlpatterns += [
    path("accounts/", include("allauth.urls")),
    path("admin/", admin.site.urls),
    path("users/", include("users.urls", namespace="users")),
    path("rest-auth/", include("rest_auth.urls")),
    # Override email confirm to use allauth's HTML view instead of rest_auth's API view
    path("rest-auth/registration/account-confirm-email/<str:key>/", confirm_email),
    path("rest-auth/registration/", include("rest_auth.registration.urls")),
    path("rest-auth/", include(("users.api.v1.urls", "users_api"), namespace="users_api")),

    path("api-docs/", schema_view.with_ui("swagger", cache_timeout=0), name="api_docs"),

    # Must be the last one due to React app
    path("", include("home.urls")),
]

admin.site.site_header = "OnlineAdObservatory"
admin.site.site_title = "OnlineAdObservatory Admin Portal"
admin.site.index_title = "OnlineAdObservatory Admin"

