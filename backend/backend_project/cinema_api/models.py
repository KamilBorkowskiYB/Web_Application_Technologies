from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

class Cinema(models.Model):
    name = models.CharField(max_length=100, blank=True)
    location_city = models.CharField(max_length=100)
    location_street = models.CharField(max_length=100)
    location_number = models.IntegerField()
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.location_city + " " + self.location_street + " " + str(self.location_number)
    
class HallType(models.Model):
    hall_type = models.CharField(max_length=100)

    def __str__(self):
        return self.hall_type

class CinemaHall(models.Model):
    hall_number = models.IntegerField()
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE)
    types = models.ManyToManyField(HallType, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['cinema', 'hall_number'], 
                name='unique_cinema_hall')
    ]

    def __str__(self):
        return str(self.cinema) + " " + str(self.hall_number)

class Seat(models.Model):
    row = models.IntegerField()
    number = models.IntegerField()
    hall = models.ForeignKey(CinemaHall, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.hall) + " " + str(self.row) + " " + str(self.number)

    
class Artist(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class MovieCrew(models.Model):
    director = models.ManyToManyField(Artist, blank=True, related_name='director')
    main_lead = models.ManyToManyField(Artist, blank=True, related_name='main_lead')

    def __str__(self):
        return f"Crew: {self.id} - Director: {str(self.director)}"

class Genre(models.Model):
    genre = models.CharField(max_length=100)

    def __str__(self):
        return self.genre


class Movie(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    release_date = models.DateField()
    duration = models.IntegerField()
    genre = models.ManyToManyField(Genre, blank=True)
    crew = models.OneToOneField(MovieCrew, on_delete=models.CASCADE, null=True)
    poster = models.ImageField(upload_to='posters/', null=True, blank=True)
    trailer = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.title

class MovieShowing(models.Model):
    date = models.DateTimeField()
    showing_type = models.ForeignKey(HallType, null=True, on_delete=models.SET_NULL)
    movie = models.ForeignKey(Movie, null=True, on_delete=models.SET_NULL)
    hall = models.ForeignKey(CinemaHall, null=True, on_delete=models.SET_NULL)
    ticket_price = models.FloatField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                #TODO: Check movie time for overlapping showings
                fields=['movie', 'date', 'hall'], 
                name='unique_showing')
    ]

    def clean(self):
        if self.date < timezone.now():
            raise ValidationError("The date must be in the future.")
        if self.showing_type not in self.hall.types.all():
            raise ValidationError("The showing type must be in the corresponding hall.")


    def __str__(self):
        return str(self.movie) + " " + str(self.date) + " " + str(self.showing_type) + " " + str(self.hall)
    
class TicketDiscount(models.Model):
    name = models.CharField(max_length=100)
    percentage = models.FloatField()
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if self.start_date >= self.end_date:
            raise ValidationError("The start date must be before the end date.")
        if self.start_date <= timezone.datetime.now():
            raise ValidationError("The start date must be in the future.")

    def __str__(self):
        return self.name

class Ticket(models.Model):
    base_price = models.FloatField()
    showing = models.ForeignKey(MovieShowing, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    purchase_time = models.DateTimeField(auto_now_add=True)
    purchase_price = models.FloatField()
    buyer = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    discount = models.ForeignKey(TicketDiscount, null=True, blank=True, on_delete=models.SET_NULL)
    cancelled = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['showing', 'seat'], 
                name='unique_ticket')
    ]

    def clean(self):
        if self.seat.hall != self.showing.hall:
            raise ValidationError("The seat must be in the same hall as the showing.")
        if Ticket.objects.filter(showing=self.showing, seat=self.seat).exists():
            raise ValidationError("The seat is already booked for this showing.")

    def __str__(self):
        return f"Ticket {self.id}"

class UserDevice(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    fcm_token = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Device {self.id} for user {self.user.username}" if self.user else "Device without user"