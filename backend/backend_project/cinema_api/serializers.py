from rest_framework import serializers
from .models import *

class CinemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cinemas
        fields = '__all__'

class HallTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HallTypes
        fields = '__all__'

#TODO: Add validation for hall_number to be unique for each cinema
class CinemaHallSerializer(serializers.ModelSerializer):
    cinema = serializers.PrimaryKeyRelatedField(queryset=Cinemas.objects.all())
    types = serializers.PrimaryKeyRelatedField(
        queryset=HallTypes.objects.all(),
        many=True
    )
    
    class Meta:
        model = CinemaHalls
        fields = '__all__'

    
class SeatSerializer(serializers.ModelSerializer):
    hall = serializers.PrimaryKeyRelatedField(queryset=CinemaHalls.objects.all())

    class Meta:
        model = Seats
        fields = '__all__'

class MovieSerializer(serializers.ModelSerializer):
    crew = serializers.PrimaryKeyRelatedField(queryset=MovieCrews.objects.all())

    class Meta:
        model = Movies
        fields = '__all__'

#TODO: Add validation for date to be in the future
#TODO: Add validation for showing_type to be in corresponding hall
class MovieShowingSerializer(serializers.ModelSerializer):
    showing_type = serializers.PrimaryKeyRelatedField(queryset=HallTypes.objects.all())
    movie = serializers.PrimaryKeyRelatedField(queryset=Movies.objects.all())
    hall = serializers.PrimaryKeyRelatedField(queryset=CinemaHalls.objects.all())

    class Meta:
        model = MovieShowings
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    showing = serializers.PrimaryKeyRelatedField(queryset=MovieShowings.objects.all())
    seat = serializers.PrimaryKeyRelatedField(queryset=Seats.objects.all())

    class Meta:
        model = Tickets
        fields = '__all__'

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artists
        fields = '__all__'

class MovieCrewSerializer(serializers.ModelSerializer):
    director = serializers.PrimaryKeyRelatedField(queryset=Artists.objects.all())
    main_lead = serializers.PrimaryKeyRelatedField(
        queryset=Artists.objects.all(), 
        many=True
    )

    def get_main_lead(self, obj):
        return ArtistSerializer(obj.main_lead.all(), many=True).data
    
    class Meta:
        model = MovieCrews
        fields = '__all__'