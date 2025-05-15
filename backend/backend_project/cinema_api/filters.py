from django_filters import rest_framework as filters
from django.contrib.auth.models import User
from .models import Movie, Genre, MovieShowing, Cinema, Seat, CinemaHall, Ticket

class MovieFilter(filters.FilterSet):
    genre = filters.ModelChoiceFilter(queryset=Genre.objects.all())
    release_date = filters.DateFromToRangeFilter(field_name='release_date')
    showing_date = filters.DateFromToRangeFilter(field_name='movieshowing__date')
    cinema = filters.ModelChoiceFilter(queryset=Cinema.objects.all(), method='cinema_filter')
    title = filters.CharFilter(field_name='title', lookup_expr='icontains')

    class Meta:
        model = Movie
        fields = ['genre', 'release_date', 'showing_date', 'cinema']
        search_fields = ['title']
        ordering_fields = ['title', 'release_date']

    def cinema_filter(self, queryset, name, value):
        if value:
            return queryset.filter(movieshowing__hall__cinema=value).distinct()
        return queryset

class MovieShowingFilter(filters.FilterSet):
    movie = filters.ModelChoiceFilter(queryset=Movie.objects.all())
    showing_date = filters.DateFromToRangeFilter(field_name='date')
    cinema = filters.ModelChoiceFilter(queryset=Cinema.objects.all(), method='cinema_filter')

    class Meta:
        model = MovieShowing
        fields = ['movie', 'cinema', 'showing_date']
        ordering_fields = ['date']

    def cinema_filter(self, queryset, name, value):
        if value:
            return queryset.filter(hall__cinema=value)
        return queryset
    
class SeatsFilter(filters.FilterSet):
    hall = filters.ModelChoiceFilter(queryset=CinemaHall.objects.all())

    class Meta:
        model = Seat
        fields = ['hall']
        ordering_fields = ['row', 'number']

class TicketFilter(filters.FilterSet):
    user = filters.ModelChoiceFilter(
        queryset=User.objects.all(),
        field_name='buyer_id',
        label='User')

    class Meta:
        model = Ticket
        fields = ['user']
        ordering_fields = ['showing__date']