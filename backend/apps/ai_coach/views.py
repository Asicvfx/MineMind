from datetime import timedelta

from django.conf import settings as dj_settings
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AICoachRequest
from .services import get_hint

FREE_HINTS_PER_DAY = 3


def _effective_is_pro(user) -> bool:
    """During beta everyone is Pro — see config.settings.FREE_PRO_FOR_EVERYONE."""
    if getattr(dj_settings, "FREE_PRO_FOR_EVERYONE", False):
        return True
    return bool(user.is_pro)


class HintView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        game_state = request.data.get("game_state")
        if not isinstance(game_state, dict) or not isinstance(game_state.get("board"), list):
            return Response({"detail": "game_state.board (2D array) required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        is_pro = _effective_is_pro(user)

        # Rate-limit only when the user is truly free (not Pro and not beta).
        if not is_pro:
            since = timezone.now() - timedelta(days=1)
            used = AICoachRequest.objects.filter(user=user, created_at__gte=since).count()
            if used >= FREE_HINTS_PER_DAY:
                return Response(
                    {
                        "detail": "Daily hint limit reached. Upgrade to Pro for unlimited hints.",
                        "limit": FREE_HINTS_PER_DAY,
                        "used": used,
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

        result = get_hint(game_state, is_pro=is_pro)

        AICoachRequest.objects.create(
            user=user,
            game_state={"rows": game_state.get("rows"), "cols": game_state.get("cols"), "mines": game_state.get("mines")},
            hint_type="next_move",
            response=result.get("explanation", ""),
            tokens_used=result.get("tokens_used", 0),
            model_used=result.get("model_used", ""),
        )

        remaining = None
        if not is_pro:
            since = timezone.now() - timedelta(days=1)
            used_now = AICoachRequest.objects.filter(user=user, created_at__gte=since).count()
            remaining = max(0, FREE_HINTS_PER_DAY - used_now)

        return Response({
            "verdict": result["verdict"],
            "cell": result["cell"],
            "explanation": result["explanation"],
            "is_pro": is_pro,
            "model_used": result.get("model_used", ""),
            "hints_remaining_today": remaining,
        })
