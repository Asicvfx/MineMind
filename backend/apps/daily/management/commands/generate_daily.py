from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.daily.services import get_or_create_for_date


class Command(BaseCommand):
    help = "Generate Daily Challenges for today and the next N days."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7, help="How many days ahead to generate")
        parser.add_argument("--rows", type=int, default=16)
        parser.add_argument("--cols", type=int, default=16)
        parser.add_argument("--mines", type=int, default=40)

    def handle(self, *args, **opts):
        today = timezone.now().date()
        for i in range(opts["days"] + 1):
            d: date = today + timedelta(days=i)
            challenge = get_or_create_for_date(d, rows=opts["rows"], cols=opts["cols"], mines=opts["mines"])
            self.stdout.write(self.style.SUCCESS(
                f"Daily for {d}: seed={challenge.seed[:12]}..., mines={challenge.mines}"
            ))
