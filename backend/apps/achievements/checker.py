"""Achievement unlock checker — called from the games.signals post_save handler."""

from typing import TYPE_CHECKING

from .models import Achievement, UserAchievement

if TYPE_CHECKING:
    from apps.games.models import Game


def _unlock(user, code: str):
    ach = Achievement.objects.filter(code=code).first()
    if not ach:
        return
    UserAchievement.objects.get_or_create(user=user, achievement=ach)


def check_achievements_after_game(user, game: "Game"):
    from apps.games.models import Game as GameModel
    from apps.ai_coach.models import AICoachRequest

    if game.result == "won":
        # First ever win
        if GameModel.objects.filter(user=user, result="won").count() == 1:
            _unlock(user, "first-win")
        # By difficulty
        if game.difficulty == "easy":
            _unlock(user, "win-easy")
        elif game.difficulty == "medium":
            _unlock(user, "win-medium")
        elif game.difficulty == "hard":
            _unlock(user, "win-hard")
            if game.time_seconds < 60:
                _unlock(user, "hard-under-60")
        # Perfect accuracy
        if game.accuracy >= 0.999:
            _unlock(user, "perfect-game")
        # Daily
        if game.difficulty == "daily":
            _unlock(user, "daily-first-win")

    # Volume + streaks
    total = GameModel.objects.filter(user=user).count()
    if total >= 100:
        _unlock(user, "100-games")
    if user.streak_days >= 3:
        _unlock(user, "streak-3")
    if user.streak_days >= 7:
        _unlock(user, "streak-7")
    if user.streak_days >= 30:
        _unlock(user, "streak-30")

    # Brain Score milestones
    if user.brain_score >= 1000:
        _unlock(user, "brain-1000")
    if user.brain_score >= 5000:
        _unlock(user, "brain-5000")

    # AI Coach usage
    if AICoachRequest.objects.filter(user=user).count() >= 10:
        _unlock(user, "ai-student")
