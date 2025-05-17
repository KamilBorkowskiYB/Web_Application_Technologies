from rest_framework import serializers
from .models import *
from rest_framework.validators import UniqueValidator
from decimal import Decimal, ROUND_HALF_UP

class CinemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cinema
        fields = '__all__'

class HallTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HallType
        fields = '__all__'

class CinemaHallSerializer(serializers.ModelSerializer):
    cinema = serializers.PrimaryKeyRelatedField(queryset=Cinema.objects.all())
    types = serializers.PrimaryKeyRelatedField(
        queryset=HallType.objects.all(),
        many=True
    )
    hall_number = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CinemaHall
        fields = '__all__'

    def create(self, validated_data):
        types = validated_data.pop('types')
        last_number = CinemaHall.objects.filter(
            cinema=validated_data['cinema']).aggregate(max_number=models.Max('hall_number')).get('max_number') or 0
        validated_data['hall_number'] = last_number + 1
        hall = CinemaHall.objects.create(**validated_data)
        hall.types.set(types)
        return hall

    
class SeatSerializer(serializers.ModelSerializer):
    hall = serializers.PrimaryKeyRelatedField(queryset=CinemaHall.objects.all())

    class Meta:
        model = Seat
        fields = '__all__'

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class MovieSerializer(serializers.ModelSerializer):
    crew = serializers.PrimaryKeyRelatedField(
        queryset=MovieCrew.objects.all(),
    )
    genre = GenreSerializer(
        many=True,
        read_only=True)
    genre_id = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), 
        many=True,
        write_only=True,
        source='genre'
    )

    class Meta:
        model = Movie
        fields = '__all__'

    def validate(self, data):
        if self.instance:
            if Movie.objects.filter(
                id=data['crew'].id
            ).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("This crew is already assigned to another movie.")
        else:
            if Movie.objects.filter(
                id=data['crew'].id
            ).exists():
                raise serializers.ValidationError("This crew is already assigned to another movie.")
        
        return data

class MovieShowingSerializer(serializers.ModelSerializer):
    showing_type = serializers.PrimaryKeyRelatedField(queryset=HallType.objects.all())
    movie = serializers.PrimaryKeyRelatedField(queryset=Movie.objects.all())
    hall = serializers.PrimaryKeyRelatedField(queryset=CinemaHall.objects.all())

    class Meta:
        model = MovieShowing
        fields = '__all__'

    def validate(self, data):
        # Check if the date is in the future
        if data['date'] < timezone.now():
            raise serializers.ValidationError("The date must be in the future.")
        
        # Check if the showing type is valid for the hall
        if data['showing_type'] not in data['hall'].types.all():
            raise serializers.ValidationError("The showing type is not valid for this hall.")
        
        return data

class TicketDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketDiscount
        fields = '__all__'

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            # Check if the start date is before the end date
            if data.get('start_date') >= data.get('end_date'):
                raise serializers.ValidationError("The start date must be before the end date.")
            
            # Check if the start date is in the future
            if data.get('start_date') <= timezone.datetime.now():
                raise serializers.ValidationError("The start date must be in the future.")
        
        return data

class TicketSerializer(serializers.ModelSerializer):
    showing = serializers.PrimaryKeyRelatedField(queryset=MovieShowing.objects.all())
    seat = serializers.PrimaryKeyRelatedField(queryset=Seat.objects.all())

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['purchase_time', 'purchase_price', 'base_price']

    def validate(self, attrs):
        # Check if the seat is already booked for the showing
        if Ticket.objects.filter(showing=attrs['showing'], seat=attrs['seat']).exists():
            raise serializers.ValidationError("This seat is already booked for this showing.")
        if attrs['seat'].hall != attrs['showing'].hall:
            raise serializers.ValidationError("The seat must be in the same hall as the showing.")

        return attrs

    def create(self, validated_data):
        # Calculate the purchase price based on the base price and discount
        showing = validated_data['showing']
        base_price = showing.ticket_price
        discount = validated_data.get('discount')

        if discount:
            purchase_price = Decimal(base_price) * (1 - Decimal(discount.percentage) / 100)
            purchase_price = purchase_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        else:
            purchase_price = base_price

        validated_data['base_price'] = base_price
        validated_data['purchase_price'] = purchase_price
        return super().create(validated_data)

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'

class MovieCrewSerializer(serializers.ModelSerializer):
    director = ArtistSerializer(many=True, read_only=True)
    main_lead = ArtistSerializer(many=True, read_only=True)
    director_id = serializers.PrimaryKeyRelatedField(
        queryset=Artist.objects.all(), 
        many=True,
        write_only=True,
        source='director'
    )
    main_lead_id = serializers.PrimaryKeyRelatedField(
        queryset=Artist.objects.all(), 
        many=True,
        write_only=True,
        source='main_lead'
    )
    
    class Meta:
        model = MovieCrew
        fields = '__all__'