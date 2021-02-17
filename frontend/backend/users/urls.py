from django.urls import path

from users.views import (
    user_redirect_view,
    user_update_view,
    user_detail_view,
    cognito_logout_view
)

app_name = "users"
urlpatterns = [
    path("aws-logout/", view=cognito_logout_view, name="cognito_logout"),
    path("~redirect/", view=user_redirect_view, name="redirect"),
    path("~update/", view=user_update_view, name="update"),
    path("<str:username>/", view=user_detail_view, name="detail"),
]
