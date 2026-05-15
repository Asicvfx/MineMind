from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .cities import CITY_OPTIONS_SET

User = get_user_model()

BLOCKED_LOCAL_PARTS = {
    "demo",
    "test",
    "testing",
    "example",
    "admin",
    "user",
    "qwerty",
}

BLOCKED_DOMAINS = {
    "demo.com",
    "example.com",
    "test.com",
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
}

ALLOWED_EXISTING_EXCEPTION_EMAILS = {
    "test1@gmail.com",
}


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    city = serializers.CharField(required=False, allow_blank=True, default="")
    country = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = ("id", "email", "username", "password", "city", "country")

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("User with this email already exists.")

        try:
            local_part, domain = email.split("@", 1)
        except ValueError:
            raise serializers.ValidationError("Enter a valid email address.")

        if email not in ALLOWED_EXISTING_EXCEPTION_EMAILS:
            if local_part in BLOCKED_LOCAL_PARTS or domain in BLOCKED_DOMAINS:
                raise serializers.ValidationError("Use a real personal email address.")

        return email

    def validate_city(self, value):
        if value and value not in CITY_OPTIONS_SET:
            raise serializers.ValidationError("Choose a city from the list.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    is_pro = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "city",
            "country",
            "avatar_url",
            "is_pro",
            "pro_until",
            "streak_days",
            "brain_score",
            "last_played_at",
            "created_at",
        )
        read_only_fields = (
            "id",
            "email",
            "is_pro",
            "pro_until",
            "streak_days",
            "brain_score",
            "last_played_at",
            "created_at",
        )

    def get_is_pro(self, obj) -> bool:
        from django.conf import settings as dj_settings

        if getattr(dj_settings, "FREE_PRO_FOR_EVERYONE", False):
            return True
        return bool(obj.is_pro)


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }
