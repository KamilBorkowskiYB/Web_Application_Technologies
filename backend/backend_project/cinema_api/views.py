from django.shortcuts import render

from .models import *
from .serializers import *
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from .tmdb_requests import movie_info
from django.conf import settings

# Create your views here.

class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
 

class HallTypeViewSet(viewsets.ModelViewSet):
    queryset = HallType.objects.all()
    serializer_class = HallTypeSerializer

class CinemaHallViewSet(viewsets.ModelViewSet):
    queryset = CinemaHall.objects.all()
    serializer_class = CinemaHallSerializer

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer

    @action(detail=False, methods=['post'])
    def auto_complete(self, request):
        """
        Get movie information from TMDB API.
        """
        title = request.data.get('title')
        language = request.data.get('language', 'en')
        year = request.data.get('year', None)

        if not title:
            return Response({"error": "Title is required"}, status=400)

        movie_info_instance = movie_info(title=title, api_key=settings.TMDB_API_KEY, language=language, year=year)

        directors = []
        for director in movie_info_instance.directors:
            artist, _ = Artist.objects.get_or_create(name=director)
            directors.append(artist)

        actors = []
        for actor in movie_info_instance.main_cast:
            artist, _ = Artist.objects.get_or_create(name=actor)
            actors.append(artist)

        movie_crew = MovieCrew.objects.create()
        movie_crew.director.set(directors)
        movie_crew.main_lead.set(actors)
        movie_crew.save()


        movie = Movie.objects.create(
            title=movie_info_instance.title,
            description=movie_info_instance.overview,
            release_date=movie_info_instance.release_date,
            duration=movie_info_instance.runtime or 0,
            trailer=movie_info_instance.trailer,
            crew=movie_crew,
        )
        movie_info_instance.save_poster(movie)
        movie.save()
        serializer = MovieSerializer(movie)
        return Response(serializer.data, status=201)

class MovieShowingViewSet(viewsets.ModelViewSet):
    queryset = MovieShowing.objects.all()
    serializer_class = MovieShowingSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

class MovieCrewViewSet(viewsets.ModelViewSet):
    queryset = MovieCrew.objects.all()
    serializer_class = MovieCrewSerializer