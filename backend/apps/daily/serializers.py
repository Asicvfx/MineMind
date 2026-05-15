from rest_framework import serializers

from .models import DailyAttempt, DailyChallenge


class DailyChallengePublicSerializer(serializers.ModelSerializer):
    """Excludes mine_positions — the frontend only learns those by clicking."""

    class Meta:
        model = DailyChallenge
        fields = ("date", "seed", "rows", "cols", "mines")


class DailyChallengeFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyChallenge
        fields = ("date", "seed", "rows", "cols", "mines", "mine_positions")


class DailyAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyAttempt
        fields = ("id", "completed", "won", "time_seconds", "accuracy", "created_at")
        read_only_fields = ("id", "created_at")


class DailyLeaderboardEntrySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    city = serializers.CharField()
    time_seconds = serializers.IntegerField()
    accuracy = serializers.FloatField()
    is_me = serializers.BooleanField()
