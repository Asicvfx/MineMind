from django.conf import settings
from django.db import models


class Game(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
        ("custom", "Custom"),
        ("daily", "Daily Challenge"),
    ]
    RESULT_CHOICES = [
        ("won", "Won"),
        ("lost", "Lost"),
        ("abandoned", "Abandoned"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="games",
    )
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    rows = models.PositiveIntegerField()
    cols = models.PositiveIntegerField()
    mines = models.PositiveIntegerField()
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    time_seconds = models.PositiveIntegerField()
    cells_revealed = models.PositiveIntegerField(default=0)
    flags_placed = models.PositiveIntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    daily_seed = models.CharField(max_length=64, blank=True, default="")
    brain_score_delta = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["difficulty", "result", "time_seconds"]),
            models.Index(fields=["daily_seed", "time_seconds"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user_id} · {self.difficulty} · {self.result} · {self.time_seconds}s"
