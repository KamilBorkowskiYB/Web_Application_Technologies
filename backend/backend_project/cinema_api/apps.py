from django.apps import AppConfig


class CinemaApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cinema_api'

    def ready(self):
        import cinema_api.signals
