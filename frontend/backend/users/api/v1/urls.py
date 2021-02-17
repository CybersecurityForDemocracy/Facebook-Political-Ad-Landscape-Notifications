from django.urls import path

from . import views

urlpatterns = [
    path('cognito', views.AmazonCognitoLogin.as_view())
]
