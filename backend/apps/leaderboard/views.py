from datetime import timedelta

from django.db.models import Min
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.games.models import Game


class LeaderboardView(APIView):
    """GET /api/leaderboard/?difficulty=hard&period=all_time&city=Almaty&type=time|brain"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        difficulty = request.query_params.get("difficulty", "medium")
        period = request.query_params.get("period", "all_time")
        city = request.query_params.get("city", "").strip()
        board_type = request.query_params.get("type", "time")

        if board_type == "brain":
            return self._brain_leaderboard(request, city)

        qs = Game.objects.filter(difficulty=difficulty, result="won")
        if city:
            qs = qs.filter(user__city__iexact=city)

        now = timezone.now()
        if period == "today":
            qs = qs.filter(created_at__gte=now - timedelta(days=1))
        elif period == "week":
            qs = qs.filter(created_at__gte=now - timedelta(days=7))
        elif period == "month":
            qs = qs.filter(created_at__gte=now - timedelta(days=30))

        # Best time per user
        best_per_user = (
            qs.values("user_id", "user__username", "user__city", "user__is_pro")
            .annotate(best_time=Min("time_seconds"))
            .order_by("best_time")[:100]
        )

        me_id = request.user.id
        rows = []
        for i, row in enumerate(best_per_user, start=1):
            rows.append({
                "rank": i,
                "user_id": row["user_id"],
                "username": row["user__username"],
                "city": row["user__city"] or "",
                "is_pro": row["user__is_pro"],
                "best_time": row["best_time"],
                "is_me": row["user_id"] == me_id,
            })
        return Response({
            "difficulty": difficulty,
            "period": period,
            "city": city,
            "type": "time",
            "results": rows,
        })

    def _brain_leaderboard(self, request, city):
        from apps.accounts.models import User

        users = User.objects.filter(brain_score__gt=0)
        if city:
            users = users.filter(city__iexact=city)
        users = users.order_by("-brain_score")[:100]

        me_id = request.user.id
        rows = []
        for i, u in enumerate(users, start=1):
            rows.append({
                "rank": i,
                "user_id": u.id,
                "username": u.username,
                "city": u.city or "",
                "is_pro": u.is_pro,
                "brain_score": u.brain_score,
                "streak_days": u.streak_days,
                "is_me": u.id == me_id,
            })
        return Response({
            "city": city,
            "type": "brain",
            "results": rows,
        })
