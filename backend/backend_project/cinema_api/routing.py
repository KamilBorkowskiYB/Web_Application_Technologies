from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/movie_showings/(?P<show_id>\d+)/$', consumers.ShowConsumer.as_asgi()),
    re_path(r'ws/movies/$', consumers.MovieConsumer.as_asgi()),
]