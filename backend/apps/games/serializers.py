from rest_framework import serializers

from .models import Game
from .scoring import calculate_brain_score


DIFFICULTY_LIMITS = {
    "easy": {"rows": (9, 9), "cols": (9, 9), "mines": (10, 10)},
    "medium": {"rows": (16, 16), "cols": (16, 16), "mines": (40, 40)},
    "hard": {"rows": (16, 16), "cols": (30, 30), "mines": (99, 99)},
    "custom": {"rows": (5, 30), "cols": (5, 30), "mines": (1, 500)},
    "daily": {"rows": (5, 40), "cols": (5, 40), "mines": (1, 500)},
}


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = (
            "id",
            "difficulty",
            "rows",
            "cols",
            "mines",
            "result",
            "time_seconds",
            "cells_revealed",
            "flags_placed",
            "accuracy",
            "daily_seed",
            "brain_score_delta",
            "created_at",
        )
        read_only_fields = ("id", "brain_score_delta", "created_at")

    def validate(self, attrs):
        difficulty = attrs["difficulty"]
        rows, cols, mines = attrs["rows"], attrs["cols"], attrs["mines"]
        limits = DIFFICULTY_LIMITS.get(difficulty)
        if limits:
            r_min, r_max = limits["rows"]
            c_min, c_max = limits["cols"]
            m_min, m_max = limits["mines"]
            if not (r_min <= rows <= r_max):
                raise serializers.ValidationError({"rows": f"out of range for {difficulty}"})
            if not (c_min <= cols <= c_max):
                raise serializers.ValidationError({"cols": f"out of range for {difficulty}"})
            if not (m_min <= mines <= m_max):
                raise serializers.ValidationError({"mines": f"out of range for {difficulty}"})
        if mines >= rows * cols:
            raise serializers.ValidationError("Too many mines for board size")
        if attrs.get("time_seconds", 0) < 0:
            raise serializers.ValidationError({"time_seconds": "must be non-negative"})
        if attrs.get("time_seconds", 0) > 24 * 3600:
            raise serializers.ValidationError({"time_seconds": "unrealistically long"})
        accuracy = attrs.get("accuracy", 0.0)
        if not (0.0 <= accuracy <= 1.0):
            raise serializers.ValidationError({"accuracy": "must be between 0 and 1"})
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        # Personal best check (faster won game on same difficulty)
        is_personal_best = False
        if validated_data["result"] == "won":
            prev_best = (
                Game.objects.filter(
                    user=user,
                    difficulty=validated_data["difficulty"],
                    result="won",
                )
                .order_by("time_seconds")
                .first()
            )
            if prev_best is None or validated_data["time_seconds"] < prev_best.time_seconds:
                is_personal_best = True

        delta = calculate_brain_score(
            difficulty=validated_data["difficulty"],
            result=validated_data["result"],
            accuracy=validated_data["accuracy"],
            is_personal_best=is_personal_best,
        )
        return Game.objects.create(user=user, brain_score_delta=delta, **validated_data)
