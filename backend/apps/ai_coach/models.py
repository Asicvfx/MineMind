from django.conf import settings
from django.db import models


class AICoachRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_requests")
    game_state = models.JSONField()
    hint_type = models.CharField(max_length=50)
    response = models.TextField()
    tokens_used = models.PositiveIntegerField(default=0)
    model_used = models.CharField(max_length=50, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]
