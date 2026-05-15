"""Daily Challenge generation — deterministic from seed."""

import hashlib
import random
from datetime import date

from .models import DailyChallenge


def seed_for_date(d: date) -> str:
    """Stable seed for a given date."""
    raw = f"minemind-daily-{d.isoformat()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


def generate_positions(rows: int, cols: int, mines: int, seed: str) -> list[list[int]]:
    rng = random.Random(seed)
    all_cells = [(r, c) for r in range(rows) for c in range(cols)]
    rng.shuffle(all_cells)
    return [[r, c] for (r, c) in all_cells[:mines]]


def get_or_create_for_date(target_date: date, *, rows: int = 16, cols: int = 16, mines: int = 40) -> DailyChallenge:
    challenge = DailyChallenge.objects.filter(date=target_date).first()
    if challenge:
        return challenge
    seed = seed_for_date(target_date)
    positions = generate_positions(rows, cols, mines, seed)
    return DailyChallenge.objects.create(
        date=target_date,
        seed=seed,
        rows=rows,
        cols=cols,
        mines=mines,
        mine_positions=positions,
    )
