from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({"status": "ok", "service": "minemind-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/games/", include("apps.games.urls")),
    path("api/daily/", include("apps.daily.urls")),
    path("api/leaderboard/", include("apps.leaderboard.urls")),
    path("api/ai-coach/", include("apps.ai_coach.urls")),
    path("api/achievements/", include("apps.achievements.urls")),
    path("api/billing/", include("apps.billing.urls")),
]
