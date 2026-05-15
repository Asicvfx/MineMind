from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Achievement, UserAchievement


class AchievementsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        all_achievements = Achievement.objects.all().order_by("order", "id")
        unlocked = {
            ua.achievement_id: ua.unlocked_at
            for ua in UserAchievement.objects.filter(user=request.user).select_related("achievement")
        }
        result = []
        for a in all_achievements:
            result.append({
                "code": a.code,
                "name": a.name,
                "description": a.description,
                "icon": a.icon,
                "rarity": a.rarity,
                "unlocked": a.id in unlocked,
                "unlocked_at": unlocked.get(a.id),
            })
        return Response({
            "total": len(result),
            "unlocked": sum(1 for r in result if r["unlocked"]),
            "items": result,
        })
