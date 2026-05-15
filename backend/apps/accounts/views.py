from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView  # noqa: F401

from .cities import CITY_OPTIONS, CITY_OPTIONS_SET
from .google_auth import GoogleAuthError, verify_google_credential
from .serializers import RegisterSerializer, UserSerializer, tokens_for_user

User = get_user_model()


def _slug_username(raw_value: str) -> str:
    base = "".join(ch.lower() if ch.isalnum() else "-" for ch in raw_value).strip("-")
    return base[:24] or "miner"


def _unique_username(identity_name: str, email: str) -> str:
    base = _slug_username(identity_name or email.split("@")[0])
    candidate = base
    suffix = 2
    while User.objects.filter(username__iexact=candidate).exists():
        candidate = f"{base[:20]}-{suffix}"
        suffix += 1
    return candidate


class RegisterView(APIView):
    """Email + password registration.

    Google-based signup goes through `GoogleLoginView` (intent=complete_register).
    Junk emails (test@, demo@, tempmail domains, …) are blocked at the
    serializer level — see `RegisterSerializer.validate_email`.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user).data,
                **tokens_for_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").lower().strip()
        password = request.data.get("password") or ""
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(
            {
                "user": UserSerializer(user).data,
                **tokens_for_user(user),
            }
        )


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        credential = str(request.data.get("credential") or "").strip()
        intent = str(request.data.get("intent") or "login").strip()
        city = str(request.data.get("city") or "").strip()

        if not credential:
            return Response(
                {"detail": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            identity = verify_google_credential(credential)
        except GoogleAuthError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(google_sub=identity.sub).first()
        if user is None:
            user = User.objects.filter(email__iexact=identity.email).first()

        if user and user.google_sub and user.google_sub != identity.sub:
            return Response(
                {"detail": "This email is already linked to another Google account."},
                status=status.HTTP_409_CONFLICT,
            )

        if intent == "login":
            if user is None:
                return Response(
                    {
                        "detail": "This Google account is not registered yet.",
                        "code": "registration_required",
                        "email": identity.email,
                        "name": identity.name,
                        "avatar_url": identity.picture,
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            changed = False
            if user.google_sub != identity.sub:
                user.google_sub = identity.sub
                changed = True
            if identity.picture and user.avatar_url != identity.picture:
                user.avatar_url = identity.picture
                changed = True
            if changed:
                user.save(update_fields=["google_sub", "avatar_url"])

            return Response(
                {
                    "user": UserSerializer(user).data,
                    **tokens_for_user(user),
                }
            )

        if intent == "prepare_register":
            if user is not None:
                return Response(
                    {
                        "detail": "This Google account already has a profile. Sign in instead.",
                        "code": "account_exists",
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            return Response(
                {
                    "code": "registration_ready",
                    "email": identity.email,
                    "name": identity.name,
                    "avatar_url": identity.picture,
                }
            )

        if intent == "complete_register":
            if user is not None:
                return Response(
                    {
                        "detail": "This Google account already has a profile. Sign in instead.",
                        "code": "account_exists",
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            if city not in CITY_OPTIONS_SET:
                return Response(
                    {
                        "detail": "Choose a city from the list.",
                        "code": "invalid_city",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = User(
                email=identity.email,
                username=_unique_username(identity.name, identity.email),
                google_sub=identity.sub,
                avatar_url=identity.picture,
                city=city,
            )
            user.set_unusable_password()
            user.save()
            return Response(
                {
                    "user": UserSerializer(user).data,
                    **tokens_for_user(user),
                }
            )

        return Response(
            {"detail": "Unsupported Google auth intent."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CityOptionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"cities": CITY_OPTIONS})


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
