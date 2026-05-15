from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "username", "city", "is_pro", "brain_score", "streak_days", "is_staff")
    list_filter = ("is_pro", "is_staff", "is_superuser", "country")
    search_fields = ("email", "username", "city")
    ordering = ("-created_at",)
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Profile", {"fields": ("city", "country", "avatar_url")}),
        ("Progress", {"fields": ("is_pro", "pro_until", "streak_days", "last_played_at", "brain_score")}),
    )
