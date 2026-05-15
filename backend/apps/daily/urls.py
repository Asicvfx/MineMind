from django.urls import path

from .views import DailyLeaderboardView, SubmitDailyView, TodayChallengeView

urlpatterns = [
    path("today/", TodayChallengeView.as_view(), name="daily-today"),
    path("submit/", SubmitDailyView.as_view(), name="daily-submit"),
    path("leaderboard/", DailyLeaderboardView.as_view(), name="daily-leaderboard"),
]
