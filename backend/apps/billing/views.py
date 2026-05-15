import logging
from datetime import datetime, timezone as dt_timezone

import stripe
from django.conf import settings
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Subscription

logger = logging.getLogger(__name__)


def _stripe_client():
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def _get_or_create_customer(user):
    sub, _ = Subscription.objects.get_or_create(user=user)
    if sub.stripe_customer_id:
        return sub, sub.stripe_customer_id
    s = _stripe_client()
    customer = s.Customer.create(email=user.email, metadata={"user_id": user.id})
    sub.stripe_customer_id = customer.id
    sub.save(update_fields=["stripe_customer_id"])
    return sub, customer.id


class BillingStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub, _ = Subscription.objects.get_or_create(user=request.user)
        return Response({
            "status": sub.status,
            "is_pro": request.user.is_pro,
            "pro_until": request.user.pro_until,
            "plan": {
                "id": "pro_monthly",
                "name": "MineMind Pro",
                "price_usd": 4.99,
                "period": "month",
                "features": [
                    "Безлимитный AI Coach (GPT-4o)",
                    "Расширенная статистика и replay",
                    "Эксклюзивные скины доски",
                    "Приоритет в очереди серверов",
                ],
            },
        })


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_PRO_PRICE_ID:
            return Response(
                {"detail": "Stripe is not configured on the server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            sub, customer_id = _get_or_create_customer(request.user)
            s = _stripe_client()
            session = s.checkout.Session.create(
                customer=customer_id,
                mode="subscription",
                line_items=[{"price": settings.STRIPE_PRO_PRICE_ID, "quantity": 1}],
                success_url=settings.STRIPE_SUCCESS_URL,
                cancel_url=settings.STRIPE_CANCEL_URL,
                metadata={"user_id": request.user.id},
            )
            return Response({"url": session.url, "session_id": session.id})
        except Exception as exc:
            logger.exception("Stripe checkout failed")
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class PortalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY:
            return Response({"detail": "Stripe is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        sub, customer_id = _get_or_create_customer(request.user)
        s = _stripe_client()
        try:
            portal = s.billing_portal.Session.create(
                customer=customer_id,
                return_url=settings.FRONTEND_URL + "/profile",
            )
            return Response({"url": portal.url})
        except Exception as exc:
            logger.exception("Stripe portal failed")
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhook events. Updates subscription status."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    s = _stripe_client()
    try:
        if settings.STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        else:
            event = stripe.Event.construct_from(request.data, stripe.api_key)
    except Exception as exc:
        logger.warning("Stripe webhook signature check failed: %s", exc)
        return Response({"detail": "invalid"}, status=status.HTTP_400_BAD_REQUEST)

    obj = event["data"]["object"]
    event_type = event["type"]

    def _apply_subscription(stripe_sub):
        customer_id = stripe_sub.get("customer")
        user = None
        sub = Subscription.objects.filter(stripe_customer_id=customer_id).first()
        if sub:
            user = sub.user
        else:
            uid = (stripe_sub.get("metadata") or {}).get("user_id")
            if uid:
                user = User.objects.filter(id=uid).first()
            if user is None:
                logger.warning("Webhook: no user for customer %s", customer_id)
                return
            sub, _ = Subscription.objects.get_or_create(user=user, defaults={"stripe_customer_id": customer_id})

        sub.stripe_subscription_id = stripe_sub.get("id") or sub.stripe_subscription_id
        sub.stripe_customer_id = customer_id
        sub.status = stripe_sub.get("status", sub.status)
        period_end_ts = stripe_sub.get("current_period_end")
        if period_end_ts:
            sub.current_period_end = datetime.fromtimestamp(period_end_ts, tz=dt_timezone.utc)
        sub.save()

        is_pro = sub.status in ("active", "trialing")
        user.is_pro = is_pro
        user.pro_until = sub.current_period_end if is_pro else None
        user.save(update_fields=["is_pro", "pro_until"])

    if event_type in (
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ):
        _apply_subscription(obj)
    elif event_type == "checkout.session.completed":
        sub_id = obj.get("subscription")
        if sub_id:
            stripe_sub = stripe.Subscription.retrieve(sub_id)
            _apply_subscription(stripe_sub)

    return Response({"received": True})
