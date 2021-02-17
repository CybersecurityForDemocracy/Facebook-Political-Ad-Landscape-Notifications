from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views.generic import DetailView, RedirectView, UpdateView

import environ
from allauth.socialaccount.models import SocialApp

User = get_user_model()
env = environ.Env()


class UserDetailView(LoginRequiredMixin, DetailView):

    model = User
    slug_field = "username"
    slug_url_kwarg = "username"


user_detail_view = UserDetailView.as_view()


class UserUpdateView(LoginRequiredMixin, UpdateView):

    model = User
    fields = ["name"]

    def get_success_url(self):
        return reverse("users:detail", kwargs={"username": self.request.user.username})

    def get_object(self):
        return User.objects.get(username=self.request.user.username)


user_update_view = UserUpdateView.as_view()


class UserRedirectView(LoginRequiredMixin, RedirectView):

    permanent = False

    def get_redirect_url(self):
        return reverse("users:detail", kwargs={"username": self.request.user.username})


user_redirect_view = UserRedirectView.as_view()


class AWSCognitoLogoutView(RedirectView):

    def get_redirect_url(self):
        social_app = SocialApp.objects.get_current('amazon_cognito', request=self.request)
        if social_app:
            client_id = social_app.client_id
        else:
            client_id = None
        domain = env.str('AMAZON_COGNITO_DOMAIN')
        logout_uri = self.request.build_absolute_uri(reverse('account_logout'))

        return f'{domain}/logout?client_id={client_id}&logout_uri={logout_uri}'


cognito_logout_view = AWSCognitoLogoutView.as_view()
