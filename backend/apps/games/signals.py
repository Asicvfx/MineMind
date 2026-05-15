from datetime import timedelta

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Game


@receiver(post_save, sender=Game)
def update_user_stats(sender, instance: Game, created: bool, **kwargs):
    if not created:
        return

    user = instance.user
    now = timezone.now()

    # Streak update — based on the day the game was played
    today = now.date()
    last_played = user.last_played_at.date() if user.last_played_at else None
    if last_played == today:
        pass
    elif last_played == today - timedelta(days=1):
        user.streak_days = (user.streak_days or 0) + 1
    elif last_played is None or last_played < today - timedelta(days=1):
        user.streak_days = 1

    user.last_played_at = now
    user.brain_score = max(0, (user.brain_score or 0) + (instance.brain_score_delta or 0))
    user.save(update_fields=["streak_days", "last_played_at", "brain_score"])

    # Achievements check (fires only if achievements app is installed)
    try:
        from apps.achievements.checker import check_achievements_after_game
        check_achievements_after_game(user, instance)
    except Exception:
        pass
