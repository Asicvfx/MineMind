from dataclasses import dataclass

from django.conf import settings


class GoogleAuthError(Exception):
    pass


@dataclass
class GoogleIdentity:
    sub: str
    email: str
    email_verified: bool
    name: str
    picture: str


def verify_google_credential(credential: str) -> GoogleIdentity:
    client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
    if not client_id:
        raise GoogleAuthError("Google Sign-In is not configured on the server.")

    try:
        from google.auth.transport import requests
        from google.oauth2 import id_token
    except ImportError as exc:
        raise GoogleAuthError("google-auth dependency is missing on the server.") from exc

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            client_id,
        )
    except Exception as exc:
        raise GoogleAuthError("Google token verification failed.") from exc

    email = str(payload.get("email", "")).lower().strip()
    sub = str(payload.get("sub", "")).strip()
    if not sub or not email:
        raise GoogleAuthError("Google account data is incomplete.")
    if not payload.get("email_verified"):
        raise GoogleAuthError("Google email is not verified.")

    return GoogleIdentity(
        sub=sub,
        email=email,
        email_verified=True,
        name=str(payload.get("name", "")).strip(),
        picture=str(payload.get("picture", "")).strip(),
    )
