from django_filters import rest_framework as filters
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Movie, Genre, MovieShowing, Cinema, Seat, CinemaHall, Ticket, HallType

class MovieFilter(filters.FilterSet):
    genre = filters.ModelChoiceFilter(queryset=Genre.objects.all())
    release_date = filters.DateFromToRangeFilter(field_name='release_date')
    showing_date = filters.DateFromToRangeFilter(field_name='movieshowing__date')
    cinema = filters.ModelChoiceFilter(queryset=Cinema.objects.all(), method='cinema_filter')
    title = filters.CharFilter(field_name='title', lookup_expr='icontains')
    upcoming_showings = filters.BooleanFilter(method='upcoming_showings_filter')


    class Meta:
        model = Movie
        fields = ['genre', 'release_date', 'showing_date', 'cinema']
        search_fields = ['title']
        ordering_fields = ['title', 'release_date']

    def cinema_filter(self, queryset, name, value):
        if value:
            return queryset.filter(movieshowing__hall__cinema=value).distinct()
        return queryset
    
    def upcoming_showings_filter(self, queryset, name, value):
        if value:
            return queryset.filter(movieshowing__date__gte=timezone.now()).distinct()
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
    showing = filters.ModelChoiceFilter(
        queryset=MovieShowing.objects.all(),
        field_name='showing',
        label='Showing')

    class Meta:
        model = Ticket
        fields = ['user', 'showing']
        ordering_fields = ['showing__date']

class CinemaHallFilter(filters.FilterSet):
    cinema = filters.ModelChoiceFilter(queryset=Cinema.objects.all())
    class Meta:
        model = CinemaHall
        fields = ['cinema']
        ordering_fields = ['name']

class HallTypeFilter(filters.FilterSet):
    hall = filters.NumberFilter(method='hall_filter')

    class Meta:
        model = HallType
        fields = ['hall']
        ordering_fields = ['name']

    def hall_filter(self, queryset, name, value):
        if value:
            return queryset.filter(cinemahall__id=value).distinct()
        return queryset