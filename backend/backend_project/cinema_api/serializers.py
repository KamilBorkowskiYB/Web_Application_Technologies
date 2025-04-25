from rest_framework import serializers
from .models import *
from rest_framework.validators import UniqueValidator

class CinemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cinemas
        fields = '__all__'

class HallTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HallTypes
        fields = '__all__'

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
    crew = serializers.PrimaryKeyRelatedField(
        queryset=MovieCrews.objects.all(),
    )

    class Meta:
        model = Movies
        fields = '__all__'

    def validate(self, data):
        if MovieCrews.objects.filter(
            id=data['crew'].id
        ).exists():
            raise serializers.ValidationError("This crew is already assigned to movie.")

class MovieShowingSerializer(serializers.ModelSerializer):
    showing_type = serializers.PrimaryKeyRelatedField(queryset=HallTypes.objects.all())
    movie = serializers.PrimaryKeyRelatedField(queryset=Movies.objects.all())
    hall = serializers.PrimaryKeyRelatedField(queryset=CinemaHalls.objects.all())

    class Meta:
        model = MovieShowings
        fields = '__all__'

    def validate(self, data):
        # Check if the date is in the future
        if data['date'] < timezone.now():
            raise serializers.ValidationError("The date must be in the future.")
        
        # Check if the showing type is valid for the hall
        if data['showing_type'] not in data['hall'].types.all():
            raise serializers.ValidationError("The showing type is not valid for this hall.")
        
        return data

class TicketSerializer(serializers.ModelSerializer):
    showing = serializers.PrimaryKeyRelatedField(queryset=MovieShowings.objects.all())
    seat = serializers.PrimaryKeyRelatedField(queryset=Seats.objects.all())

    class Meta:
        model = Tickets
        fields = '__all__'

    def validate(self, attrs):
        # Check if the seat is already booked for the showing
        if Tickets.objects.filter(showing=attrs['showing'], seat=attrs['seat']).exists():
            raise serializers.ValidationError("This seat is already booked for this showing.")
        if attrs['seat'].hall != attrs['showing'].hall:
            raise serializers.ValidationError("The seat must be in the same hall as the showing.")

        return attrs

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