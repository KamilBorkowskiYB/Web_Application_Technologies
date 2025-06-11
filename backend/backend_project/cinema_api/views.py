from django.shortcuts import render
from django.conf import settings
from django.db.models import Q, F, Func, FloatField
from django.shortcuts import redirect
from django.http import HttpResponse
from django.db.models.expressions import Value
from django.db.models.functions import Sqrt, Power

from .models import *
from .serializers import *
from .filters import *

from rest_framework import viewsets, filters, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from .tmdb_requests import movie_info
from .utils import seat_generation, movie_qr_code


class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer

    @action(detail=False, methods=['get'])
    def get_closest(self, request):
        """
        Get all cinemas within a specified distance from the user's location.
        """
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        amount = request.query_params.get('amount', 5)
        if not latitude or not longitude:
            return Response({"error": "Latitude and longitude are required"}, status=400)
        try:
            latitude = float(latitude)
            longitude = float(longitude)
            amount = int(amount) if amount else 5
        except ValueError:
            return Response({"error": "Latitude, longitude, and amount must be valid numbers"}, status=400)
        
        cinemas = self.queryset.annotate(
            distance=Sqrt(
                Power(F('latitude') - Value(latitude), 2) +
                Power(F('longitude') - Value(longitude), 2)
            )
        ).filter(
            latitude__isnull=False,
            longitude__isnull=False,
        ).order_by('distance')[:amount]
        serializer = self.get_serializer(cinemas, many=True)
        return Response(serializer.data)


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

    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        """
        Generate a QR code for the movie.
        """
        movie = self.get_object()
        qr_code_image = movie_qr_code(movie)
        if not qr_code_image:
            return Response({"error": "QR code generation failed"}, status=500)
        
        response = HttpResponse(qr_code_image, content_type='image/png')
        # response['Content-Disposition'] = f'attachment; filename="{movie.title}_qr.png"'
        return response

class MovieShowingViewSet(viewsets.ModelViewSet):
    queryset = MovieShowing.objects.all()
    serializer_class = MovieShowingSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter]
    filterset_class = MovieShowingFilter
    ordering_fields = ['date']
    ordering = ['-date']

    @action(detail=False, methods=['post'])
    def add_showing_in_period(self, request):
        """Add multiple showings for a movie in a specified period."""
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
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


    def get(self, request):
        user = request.user
        ticket = Ticket.objects.filter(buyer=user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'tickets': TicketSerializer(ticket, many=True).data,
        })
    
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user.set_password(request.data.get('password1', user.password))
            user.save()
            print("User password set to:", user.password)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def google_login_redirect(request):
    user = request.user
    token = RefreshToken.for_user(user).access_token
    
    frontend_url = request.GET.get("next", f"{settings.FRONTEND_URL}/after-google-login")
    return redirect(f"{frontend_url}?token={token}")
