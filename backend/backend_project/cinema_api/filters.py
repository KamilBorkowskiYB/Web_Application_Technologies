from django_filters import rest_framework as filters
from .models import Movie, Genre, MovieShowing, Cinema

class MovieFilter(filters.FilterSet):
    genre = filters.ModelChoiceFilter(queryset=Genre.objects.all())
    release_date = filters.DateFromToRangeFilter(field_name='release_date')
    showing_date = filters.DateFromToRangeFilter(field_name='movieshowing__date')
    cinema = filters.ModelChoiceFilter(queryset=Cinema.objects.all(), method='cinema_filter')

    class Meta:
        model = Movie
        fields = ['genre', 'release_date', 'showing_date', 'cinema']

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

    def cinema_filter(self, queryset, name, value):
        if value:
            return queryset.filter(hall__cinema=value)
        return queryset