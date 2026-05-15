"""
seed_demo_users — populate the leaderboard with realistic-looking Kazakh users.

Idempotent: re-running won't create duplicates (looks up by email).

Usage:
    python manage.py seed_demo_users           # default: 25 users
    python manage.py seed_demo_users --count 40
    python manage.py seed_demo_users --wipe    # delete previous demo users first
"""

from __future__ import annotations

import random
import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.cities import CITY_OPTIONS_SET
from apps.games.models import Game
from apps.games.scoring import BASE_SCORE, calculate_brain_score

User = get_user_model()

# Kazakh-flavoured first / last names — realistic but generic enough to not
# accidentally match real people.
FIRST_NAMES = [
    "Asylzhan", "Aigerim", "Daulet", "Aizhan", "Bauyrzhan", "Madina",
    "Nurlan", "Aruzhan", "Ruslan", "Dana", "Yerlan", "Saltanat",
    "Timur", "Aliya", "Bekzat", "Zhanar", "Sanzhar", "Gulnara",
    "Olzhas", "Aida", "Arman", "Kamila", "Dias", "Tomiris",
    "Yernar", "Aksholpan", "Galymzhan", "Aizere", "Adilet", "Balzhan",
]
LAST_NAMES = [
    "Tulebayev", "Akhmetova", "Nurpeisov", "Sagimbayeva", "Kassymov",
    "Suleimenova", "Bekov", "Iskakova", "Zhumabekov", "Karimova",
    "Aldabergen", "Mukhamedjanova", "Serikbay", "Beisenova", "Aitmukhamet",
    "Tursynova", "Sadykov", "Dauletkyzy", "Omarov", "Kabidenova",
    "Khassen", "Issabek", "Bayzakov", "Akhmet", "Niyazov",
]

# Heavily weighted toward Kazakhstan, with a few neighbour-region accents.
KZ_CITIES = [
    "Almaty", "Almaty", "Almaty", "Almaty", "Almaty",  # weight 5
    "Astana", "Astana", "Astana", "Astana",            # weight 4
    "Shymkent", "Shymkent", "Shymkent",                # weight 3
    "Karaganda", "Karaganda",
    "Aktobe", "Aktau", "Atyrau",
    "Kostanay", "Pavlodar", "Taraz",
    "Ust-Kamenogorsk", "Semey", "Kyzylorda",
    "Taldykorgan", "Uralsk", "Petropavl",
    "Kokshetau", "Turkistan",
]

DIFFICULTIES = ["easy", "medium", "hard"]
DIFF_CFG = {
    "easy":   {"rows": 9,  "cols": 9,  "mines": 10,  "win_time": (12, 90),  "lose_time": (3, 25)},
    "medium": {"rows": 16, "cols": 16, "mines": 40,  "win_time": (55, 280), "lose_time": (5, 60)},
    "hard":   {"rows": 16, "cols": 30, "mines": 99,  "win_time": (180, 700), "lose_time": (5, 120)},
}


def _email_for(first: str, last: str, used: set[str]) -> str:
    """Return a gmail-ish address that doesn't collide with existing users."""
    base = f"{first}.{last}".lower()
    candidate = f"{base}@gmail.com"
    suffix = 1
    while candidate in used or User.objects.filter(email__iexact=candidate).exists():
        suffix += 1
        candidate = f"{base}{suffix}@gmail.com"
    used.add(candidate)
    return candidate


def _make_game(user, difficulty: str, when):
    cfg = DIFF_CFG[difficulty]
    is_win = random.random() < 0.55  # roughly 55% win rate per played game
    result = "won" if is_win else "lost"

    if is_win:
        time_seconds = random.randint(*cfg["win_time"])
        accuracy = round(random.uniform(0.7, 1.0), 2)
        flags_placed = cfg["mines"]
        cells_revealed = cfg["rows"] * cfg["cols"] - cfg["mines"]
    else:
        time_seconds = random.randint(*cfg["lose_time"])
        accuracy = round(random.uniform(0.0, 0.6), 2)
        flags_placed = random.randint(0, max(1, cfg["mines"] // 3))
        cells_revealed = random.randint(0, (cfg["rows"] * cfg["cols"]) // 2)

    delta = calculate_brain_score(
        difficulty=difficulty,
        result=result,
        accuracy=accuracy,
    )
    g = Game.objects.create(
        user=user,
        difficulty=difficulty,
        rows=cfg["rows"],
        cols=cfg["cols"],
        mines=cfg["mines"],
        result=result,
        time_seconds=time_seconds,
        cells_revealed=cells_revealed,
        flags_placed=flags_placed,
        accuracy=accuracy,
        brain_score_delta=delta,
    )
    # back-date created_at so the timeline isn't a single instant
    Game.objects.filter(pk=g.pk).update(created_at=when)
    return delta


class Command(BaseCommand):
    help = "Seed demo users from Kazakh cities so leaderboards look populated."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=25)
        parser.add_argument(
            "--wipe",
            action="store_true",
            help="Delete previously-seeded demo users before re-seeding.",
        )

    def handle(self, *args, **opts):
        # Validate cities (in case CITY_OPTIONS_SET diverges in future).
        bad = [c for c in set(KZ_CITIES) if c not in CITY_OPTIONS_SET]
        if bad:
            self.stderr.write(self.style.ERROR(f"Cities not in canonical list: {bad}"))
            return

        if opts["wipe"]:
            qs = User.objects.filter(username__startswith="demo_")
            n = qs.count()
            qs.delete()
            self.stdout.write(self.style.WARNING(f"Wiped {n} previously-seeded demo users."))

        count = opts["count"]
        used_emails: set[str] = set()
        created = 0
        skipped = 0

        for _ in range(count):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            username = f"demo_{first.lower()}_{last.lower()}"
            # Allow username collisions across runs — only create if doesn't exist.
            if User.objects.filter(username=username).exists():
                skipped += 1
                continue

            email = _email_for(first, last, used_emails)
            city = random.choice(KZ_CITIES)
            user = User.objects.create(
                email=email,
                username=username,
                city=city,
                country="Kazakhstan",
            )
            # Unguessable random password — these are demo accounts, no one
            # is expected to log in as them.
            user.set_password(secrets.token_urlsafe(24))
            user.is_pro = random.random() < 0.25  # ~25% Pro for variety
            user.streak_days = random.randint(0, 28)

            # 4-14 games over the last 30 days
            games_count = random.randint(4, 14)
            brain_total = 0
            last_played = None
            for _g in range(games_count):
                difficulty = random.choices(DIFFICULTIES, weights=[5, 4, 2], k=1)[0]
                days_ago = random.randint(0, 30)
                hours_ago = random.randint(0, 23)
                when = timezone.now() - timedelta(days=days_ago, hours=hours_ago)
                delta = _make_game(user, difficulty, when)
                brain_total += delta
                if last_played is None or when > last_played:
                    last_played = when

            user.brain_score = brain_total
            user.last_played_at = last_played
            user.save()
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Created {created} demo users (skipped {skipped} dup usernames)."
        ))
        self.stdout.write(
            "Leaderboard preview — top-10 by Brain Score:"
        )
        for u in User.objects.filter(username__startswith="demo_").order_by("-brain_score")[:10]:
            self.stdout.write(
                f"  {u.brain_score:>5}  {u.username:<35}  {u.city}"
            )
