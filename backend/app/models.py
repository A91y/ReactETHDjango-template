# models.py
from django.db import models


class Blog(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey('Profile', on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Profile(models.Model):
    user_address = models.CharField(max_length=42, primary_key=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
