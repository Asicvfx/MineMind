from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.games.models import Game
from apps.games.scoring import calculate_brain_score

from .models import DailyAttempt
from .serializers import (
    DailyAttemptSerializer,
    DailyChallengeFullSerializer,
    DailyChallengePublicSerializer,
    DailyLeaderboardEntrySerializer,
)
from .services import get_or_create_for_date


class TodayChallengeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        challenge = get_or_create_for_date(today)
        attempt = DailyAttempt.objects.filter(user=request.user, challenge=challenge).first()
        # Include mine_positions so the frontend can use the exact same field
        # (the daily is "same field for everyone" — there's no anti-cheat layer here,
        # we just deliver the seed deterministically).
        data = DailyChallengeFullSerializer(challenge).data
        data["already_attempted"] = bool(attempt)
        data["attempt"] = DailyAttemptSerializer(attempt).data if attempt else None
        return Response(data)


class SubmitDailyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        today = timezone.now().date()
        challenge = get_or_create_for_date(today)

        result = request.data.get("result")  # "won" / "lost"
        time_seconds = int(request.data.get("time_seconds") or 0)
        accuracy = float(request.data.get("accuracy") or 0.0)
        cells_revealed = int(request.data.get("cells_revealed") or 0)
        flags_placed = int(request.data.get("flags_placed") or 0)

        if result not in ("won", "lost"):
            return Response({"detail": "result must be 'won' or 'lost'"}, status=status.HTTP_400_BAD_REQUEST)
        if time_seconds <= 0 or time_seconds > 24 * 3600:
            return Response({"detail": "invalid time"}, status=status.HTTP_400_BAD_REQUEST)
        if not (0.0 <= accuracy <= 1.0):
            return Response({"detail": "accuracy out of range"}, status=status.HTTP_400_BAD_REQUEST)

        attempt, created = DailyAttempt.objects.get_or_create(
            user=request.user,
            challenge=challenge,
            defaults={
                "completed": True,
                "won": result == "won",
                "time_seconds": time_seconds,
                "accuracy": accuracy,
            },
        )
        if not created and not attempt.completed:
            attempt.completed = True
            attempt.won = result == "won"
            attempt.time_seconds = time_seconds
            attempt.accuracy = accuracy
            attempt.save()

        # Also save as a Game for global stats
        delta = calculate_brain_score(
            difficulty="daily",
            result=result,
            accuracy=accuracy,
        )
        Game.objects.create(
            user=request.user,
            difficulty="daily",
            rows=challenge.rows,
            cols=challenge.cols,
            mines=challenge.mines,
            result=result,
            time_seconds=time_seconds,
            cells_revealed=cells_revealed,
            flags_placed=flags_placed,
            accuracy=accuracy,
            daily_seed=challenge.seed,
            brain_score_delta=delta,
        )

        return Response({"detail": "ok", "attempt": DailyAttemptSerializer(attempt).data, "brain_score_delta": delta})


class DailyLeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        challenge = get_or_create_for_date(today)
        attempts = (
            DailyAttempt.objects.filter(challenge=challenge, completed=True, won=True)
            .select_related("user")
            .order_by("time_seconds", "-accuracy")[:100]
        )
        rows = []
        me_id = request.user.id
        for i, a in enumerate(attempts, start=1):
            rows.append({
                "rank": i,
                "user_id": a.user_id,
                "username": a.user.username,
                "city": a.user.city,
                "time_seconds": a.time_seconds,
                "accuracy": a.accuracy,
                "is_me": a.user_id == me_id,
            })
        return Response({
            "date": today.isoformat(),
            "challenge": DailyChallengePublicSerializer(challenge).data,
            "results": DailyLeaderboardEntrySerializer(rows, many=True).data,
        })
