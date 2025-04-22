from django.shortcuts import render

from .models import *
from .serializers import *
from rest_framework import viewsets
from rest_framework.response import Response

# Create your views here.

class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinemas.objects.all()
    serializer_class = CinemaSerializer
 

class HallTypeViewSet(viewsets.ModelViewSet):
    queryset = HallTypes.objects.all()
    serializer_class = HallTypeSerializer

class CinemaHallViewSet(viewsets.ModelViewSet):
    queryset = CinemaHalls.objects.all()
    serializer_class = CinemaHallSerializer

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seats.objects.all()
    serializer_class = SeatSerializer

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movies.objects.all()
    serializer_class = MovieSerializer

class MovieShowingViewSet(viewsets.ModelViewSet):
    queryset = MovieShowings.objects.all()
    serializer_class = MovieShowingSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Tickets.objects.all()
    serializer_class = TicketSerializer

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artists.objects.all()
    serializer_class = ArtistSerializer

class MovieCrewViewSet(viewsets.ModelViewSet):
    queryset = MovieCrews.objects.all()
    serializer_class = MovieCrewSerializer