from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _


class User(AbstractUser):

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = models.CharField(_("Name of User"), blank=True, null=True, max_length=255)
    role = models.CharField(max_length=50, null=True)
    organisation = models.CharField(max_length=50, null=True)

    def get_absolute_url(self):
        return reverse("users:detail", kwargs={"username": self.username})
