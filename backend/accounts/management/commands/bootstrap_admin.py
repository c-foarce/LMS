
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Promote an existing user to LMS administrator."

    def handle(self, *args, **options):
        username = os.environ.get("BOOTSTRAP_ADMIN_USERNAME")

        if not username:
            self.stdout.write("Admin bootstrap skipped.")
            return

        User = get_user_model()

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(
                f"User '{username}' does not exist in the production database."
            )

        user.role = User.Roles.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.save(
            update_fields=["role", "is_staff", "is_superuser"]
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully promoted '{username}' to administrator."
            )
        )
