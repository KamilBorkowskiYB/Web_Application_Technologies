from django.shortcuts import render
from django.conf import settings
from django.db.models import Q

from .models import *
from .serializers import *
from .filters import *

from rest_framework import viewsets, filters, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken

from .tmdb_requests import movie_info
from .utils import seat_generation


class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
 

class HallTypeViewSet(viewsets.ModelViewSet):
    queryset = HallType.objects.all()
    serializer_class = HallTypeSerializer

class CinemaHallViewSet(viewsets.ModelViewSet):
    queryset = CinemaHall.objects.all()
    serializer_class = CinemaHallSerializer
    
    @action(detail=True, methods=['post'])
    def generate_seats(self, request, pk=None):
        hall = self.get_object()
        row_count = request.data.get('row_count')
        seat_per_row = request.data.get('seat_per_row')

        if not row_count or not seat_per_row:
            return Response({"error": "Row count and seat per row are required"}, status=400)

        # Call the utility function to generate seats
        seat_generation(hall, row_count, seat_per_row)
        
        return Response(CinemaHallSerializer(hall).data, status=201)

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = SeatsFilter

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter]
    filterset_class = MovieFilter
    ordering_fields = ['title', 'release_date', 'duration']
    ordering = ['-release_date']

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

        genres = []
        for genre in movie_info_instance.genres:
            genre_instance, _ = Genre.objects.get_or_create(genre=genre)
            genres.append(genre_instance)

        movie = Movie.objects.create(
            title=movie_info_instance.title,
            description=movie_info_instance.overview,
            release_date=movie_info_instance.release_date,
            duration=movie_info_instance.runtime or 0,
            trailer=movie_info_instance.trailer,
            crew=movie_crew,
        )
        movie_info_instance.save_poster(movie)
        movie.genre.set(genres)
        movie.save()
        serializer = MovieSerializer(movie)
        return Response(serializer.data, status=201)

class MovieShowingViewSet(viewsets.ModelViewSet):
    queryset = MovieShowing.objects.all()
    serializer_class = MovieShowingSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter]
    filterset_class = MovieShowingFilter
    ordering_fields = ['date']
    ordering = ['-date']

class TicketDiscountViewSet(viewsets.ModelViewSet):
    queryset = TicketDiscount.objects.all()
    serializer_class = TicketDiscountSerializer

    @action(detail=False, methods=['get'])
    def active_discounts(self, request):
        """
        Get all active discounts.
        """
        today = timezone.now().date()
        discounts = self.queryset.filter(
            Q(start_date__lte=today, end_date__gte=today) |
            Q(start_date__isnull=True, end_date__isnull=True))
        serializer = self.get_serializer(discounts, many=True)
        return Response(serializer.data)

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter]
    filterset_class = TicketFilter
    ordering_fields = ['showing__date', 'purchase_time']
    ordering = ['-showing__date']

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

class MovieCrewViewSet(viewsets.ModelViewSet):
    queryset = MovieCrew.objects.all()
    serializer_class = MovieCrewSerializer

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        return Response({
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_201_CREATED)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        ticket = Ticket.objects.filter(user=user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'tickets': TicketSerializer(ticket, many=True).data,
        })

def google_login_redirect(request):
    user = request.user
    token = RefreshToken.for_user(user).access_token
    
    frontend_url = request.GET.get("next", f"{settings.FRONTEND_URL}/after-google-login")
    return redirect(f"{frontend_url}?token={token}")
