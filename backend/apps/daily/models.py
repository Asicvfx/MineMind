from django.conf import settings
from django.db import models


class DailyChallenge(models.Model):
    date = models.DateField(unique=True)
    seed = models.CharField(max_length=64, unique=True)
    rows = models.PositiveIntegerField(default=16)
    cols = models.PositiveIntegerField(default=16)
    mines = models.PositiveIntegerField(default=40)
    mine_positions = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Daily {self.date} ({self.rows}x{self.cols}, {self.mines} mines)"


class DailyAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_attempts")
    challenge = models.ForeignKey(DailyChallenge, on_delete=models.CASCADE, related_name="attempts")
    completed = models.BooleanField(default=False)
    won = models.BooleanField(default=False)
    time_seconds = models.PositiveIntegerField(null=True, blank=True)
    accuracy = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "challenge")]
        indexes = [
            models.Index(fields=["challenge", "time_seconds"]),
        ]
