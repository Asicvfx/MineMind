"""Brain Score calculation."""

from __future__ import annotations

BASE_SCORE = {
    "easy": 10,
    "medium": 25,
    "hard": 60,
    "custom": 20,
    "daily": 50,
}


def calculate_brain_score(
    *,
    difficulty: str,
    result: str,
    accuracy: float,
    is_personal_best: bool = False,
    is_top_10_percent: bool = False,
) -> int:
    """Return the Brain Score delta for one finished game."""
    base = BASE_SCORE.get(difficulty, 15)

    if result == "won":
        difficulty_mult = 1.0
    elif result == "lost":
        difficulty_mult = 0.3
    else:
        return 0

    if accuracy >= 1.0:
        accuracy_mult = 1.5
    elif accuracy > 0.8:
        accuracy_mult = 1.2
    elif accuracy > 0.6:
        accuracy_mult = 1.0
    else:
        accuracy_mult = 0.8

    speed_bonus = 1.0
    if is_top_10_percent:
        speed_bonus += 0.3
    if is_personal_best:
        speed_bonus += 0.2

    return int(round(base * difficulty_mult * accuracy_mult * speed_bonus))
