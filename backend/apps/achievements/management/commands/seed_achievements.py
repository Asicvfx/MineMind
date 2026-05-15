from django.core.management.base import BaseCommand

from apps.achievements.definitions import ACHIEVEMENTS
from apps.achievements.models import Achievement


class Command(BaseCommand):
    help = "Seed canonical Achievement rows from definitions.py"

    def handle(self, *args, **options):
        created, updated = 0, 0
        for entry in ACHIEVEMENTS:
            obj, was_created = Achievement.objects.update_or_create(
                code=entry["code"],
                defaults={k: v for k, v in entry.items() if k != "code"},
            )
            if was_created:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(f"Achievements seeded: {created} created, {updated} updated"))
