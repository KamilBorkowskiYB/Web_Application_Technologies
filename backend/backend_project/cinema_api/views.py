from django.shortcuts import render
from django.conf import settings
from django.db.models import Q

from .models import *
from .serializers import *
from .filters import *

from rest_framework import viewsets, filters, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from .tmdb_requests import MovieInfo
from .utils import seat_generation


class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
 

class HallTypeViewSet(viewsets.ModelViewSet):
    queryset = HallType.objects.all()
    serializer_class = HallTypeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = HallTypeFilter

class CinemaHallViewSet(viewsets.ModelViewSet):
    queryset = CinemaHall.objects.all()
    serializer_class = CinemaHallSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CinemaHallFilter
    
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

    @action(detail=False, methods=['post'], authentication_classes=[JWTAuthentication], permission_classes=[IsAuthenticated])
    def auto_complete(self, request):
        """
        Get movie information from TMDB API.
        """
        user = request.user
        if not user.is_staff:
            return Response({"error": "Only staff can add movies"}, status=403)

        title = request.data.get('title')
        language = request.data.get('language', 'en')
        year = request.data.get('year', None)

        if not title:
            return Response({"error": "Title is required"}, status=400)

        movie_info_instance = MovieInfo(title=title, api_key=settings.TMDB_API_KEY, language=language, year=year)

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

        movie, created = Movie.objects.get_or_create(
            title=movie_info_instance.title,
            release_date=movie_info_instance.release_date,
            defaults={
                "trailer": movie_info_instance.trailer,
                "description": movie_info_instance.overview,
                "crew": movie_crew,
                "duration": movie_info_instance.runtime,
            }
        )

        if created:
            print(f"Saving poster for movie: {movie.title}: {movie_info_instance.poster_url}")
            movie.save_poster(movie_info_instance.poster_url)
            movie.genre.set(genres)
            movie.save()
        serializer = MovieSerializer(movie, context={'request': request})
        return Response(serializer.data, status=201)
    
    @action(detail=False, methods=['post'], authentication_classes=[JWTAuthentication], permission_classes=[IsAuthenticated])
    def fetch_data(self, request):
        """
        Fetch movie data from TMDB API without creating a Movie instance.
        """
        user = request.user
        if not user.is_staff:
            return Response({"error": "Only staff can fetch movie data"}, status=403)

        title = request.data.get('title')
        language = request.data.get('language', 'en')
        year = request.data.get('year', None)

        if not title:
            return Response({"error": "Title is required"}, status=400)

        movie_info_instance = MovieInfo(title=title, api_key=settings.TMDB_API_KEY, language=language, year=year)

        data = movie_info_instance.serialize()

        #check if movie already exists
        existing_movie = Movie.objects.filter(original_title=movie_info_instance.original_title, release_date=movie_info_instance.release_date).first()
        if existing_movie:
            data['id'] = existing_movie.id

        return Response(data, status=200)
    
    @action(detail=False, methods=['post'], authentication_classes=[JWTAuthentication], permission_classes=[IsAuthenticated])
    def full_create(self, request):
        """
        Create a Movie instance with creating related Artist and MovieCrew instances.
        """
        user = request.user
        if not user.is_staff:
            return Response({"error": "Only staff can fetch movie data"}, status=403)
        
        movie_data = request.data.get('movie')      # data in MovieInfo.serialize() dict format
        if not movie_data:
            return Response({"error": "Movie data is required"}, status=400)
        print(f"Received movie data for creation: {movie_data}")
        directors = []
        for director in movie_data.get('directors', []):
            artist, _ = Artist.objects.get_or_create(name=director)
            directors.append(artist)

        actors = []
        for actor in movie_data.get('main_cast', []):
            artist, _ = Artist.objects.get_or_create(name=actor)
            actors.append(artist)
        movie_crew = MovieCrew.objects.create()
        movie_crew.director.set(directors)
        movie_crew.main_lead.set(actors)
        movie_crew.save()

        genres = []
        for genre in movie_data.get('genres', []):
            genre_instance, _ = Genre.objects.get_or_create(genre=genre)
            genres.append(genre_instance)

        if movie_data.get('id'):
            existing_movie = Movie.objects.filter(id=movie_data.get('id')).first()
            if existing_movie:
                serializer = MovieSerializer(existing_movie, data={
                    "title": movie_data.get('title'),
                    "original_title": movie_data.get('original_title'),
                    "release_date": movie_data.get('release_date'),
                    "trailer": movie_data.get('trailer'),
                    "description": movie_data.get('description'),
                    "crew": movie_crew.id,
                    "duration": movie_data.get('duration'),
                }, partial=True, context={'request': request})
                if serializer.is_valid():
                    movie = serializer.save()
                    movie.genre.set(genres)
                    movie.save()
                    return Response(serializer.data, status=200)
                else:
                    return Response(serializer.errors, status=400)

        movie, created = Movie.objects.get_or_create(
            title=movie_data.get('title'),
            release_date=movie_data.get('release_date'),
            defaults={
                "trailer": movie_data.get('trailer'),
                "description": movie_data.get('description'),
                "crew": movie_crew,
                "duration": movie_data.get('duration'),
            }
        )

        if created:
            movie.save_poster(movie_data.get('poster'))
            movie.genre.set(genres)
            movie.save()
        serializer = MovieSerializer(movie, context={'request': request})
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

    @action(detail=False, methods=['post'], authentication_classes=[JWTAuthentication], permission_classes=[IsAuthenticated])
    def add_showing_in_period(self, request):
        """Add multiple showings for a movie in a specified period."""
        user = request.user
        if not user.is_staff:
            return Response({"error": "Only staff can add showings"}, status=403)

        # date = request.data.get('date')
        movie = request.data.get('movie')
        hall = request.data.get('hall')
        showing_type = request.data.get('showing_type')
        ticket_price = request.data.get('ticket_price')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        hours = request.data.get('hours')
        if not movie or not hall or not showing_type or not ticket_price or not start_date or not end_date or not hours:
            return Response({"error": "All fields are required"}, status=400)

        start_date = timezone.datetime.strptime(start_date, '%Y-%m-%d')
        end_date = timezone.datetime.strptime(end_date, '%Y-%m-%d')
        hours = [timezone.datetime.strptime(hour, '%H:%M').time() for hour in hours]
        if start_date >= end_date:
            return Response({"error": "Start date must be before end date"}, status=400)
        if start_date.date() <= timezone.localdate():
            return Response({"error": "Start date must be in the future"}, status=400)
        
        days = (end_date - start_date).days + 1

        for day in range(days):
            current_date = start_date + timezone.timedelta(days=day)
            for hour in hours:
                date_time = timezone.datetime.combine(current_date, hour)
                if timezone.is_naive(date_time):
                    date_time = timezone.make_aware(date_time)
                if date_time < timezone.now():
                    continue
                try:
                    MovieShowing.objects.create(
                        date=date_time,
                        movie_id=movie,
                        hall_id=hall,
                        showing_type_id=showing_type,
                        ticket_price=ticket_price
                    )
                except Exception as e:
                    return Response({"error": str(e)}, status=400)
        return Response({"message": "Showings added successfully"}, status=201)


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
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user
        print("User:", user)
        if user.is_authenticated:
            print("Authenticated user:", user)
            serializer.save(buyer=user)
        else:
            print("Anonymous user, saving without user")
            serializer.save()

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

class MovieCrewViewSet(viewsets.ModelViewSet):
    queryset = MovieCrew.objects.all()
    serializer_class = MovieCrewSerializer

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = GenreFilter
    ordering_fields = ['name']

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        return Response({
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_201_CREATED)

class UserProfileView(viewsets.ViewSet):    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        ticket = Ticket.objects.filter(buyer=user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'tickets': TicketSerializer(ticket, many=True).data,
            'is_staff': user.is_staff,
        })
    
    @action(detail=False, methods=['put'], url_path='update_profile')
    def update_profile(self, request, pk=None):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='change_password')
    def change_password(self, request):
        user = request.user
        serializer = UserPasswordUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['password1'])
            user.save()
            return Response({"username": user.username, "message": "Password updated successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def google_login_redirect(request):
    user = request.user
    token = RefreshToken.for_user(user).access_token
    
    frontend_url = request.GET.get("next", f"{settings.FRONTEND_URL}/after-google-login")
    return redirect(f"{frontend_url}?token={token}")
