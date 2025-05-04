from django.shortcuts import render

from .models import *
from .serializers import *
from rest_framework import viewsets
from rest_framework.response import Response

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