"""
ASGI config for backend_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import cinema_api.routing as routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')

django_asgi_app = get_asgi_application()
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    # TODO: AuthMiddlewareStack
    "websocket": URLRouter(
        routing.websocket_urlpatterns
    )
})
