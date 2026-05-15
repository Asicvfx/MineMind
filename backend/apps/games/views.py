from django.db.models import Avg, Count, Min, Q
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Game
from .serializers import GameSerializer


class GameViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Game.objects.filter(user=self.request.user).order_by("-created_at")
        result = self.request.query_params.get("result")
        if result in {"won", "lost", "abandoned"}:
            qs = qs.filter(result=result)
        difficulty = self.request.query_params.get("difficulty")
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        return qs

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        qs = Game.objects.filter(user=request.user)
        by_difficulty = []
        for diff, _label in Game.DIFFICULTY_CHOICES:
            d_qs = qs.filter(difficulty=diff)
            total = d_qs.count()
            if total == 0:
                continue
            wins = d_qs.filter(result="won").count()
            best = d_qs.filter(result="won").aggregate(b=Min("time_seconds"))["b"]
            avg = d_qs.aggregate(a=Avg("time_seconds"))["a"]
            avg_acc = d_qs.aggregate(a=Avg("accuracy"))["a"] or 0.0
            by_difficulty.append({
                "difficulty": diff,
                "games": total,
                "wins": wins,
                "losses": d_qs.filter(result="lost").count(),
                "win_rate": (wins / total) if total else 0.0,
                "best_time": best,
                "avg_time": round(avg or 0.0, 1),
                "avg_accuracy": round(avg_acc, 3),
            })

        totals = qs.aggregate(
            games=Count("id"),
            wins=Count("id", filter=Q(result="won")),
            losses=Count("id", filter=Q(result="lost")),
        )

        return Response({
            "totals": {
                "games": totals["games"] or 0,
                "wins": totals["wins"] or 0,
                "losses": totals["losses"] or 0,
                "win_rate": (totals["wins"] / totals["games"]) if totals["games"] else 0.0,
                "brain_score": request.user.brain_score,
                "streak_days": request.user.streak_days,
            },
            "by_difficulty": by_difficulty,
        })
