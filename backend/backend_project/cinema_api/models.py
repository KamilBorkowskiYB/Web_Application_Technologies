from django.db import models

class Cinemas(models.Model):
    name = models.CharField(max_length=100, blank=True)
    location_city = models.CharField(max_length=100)
    location_street = models.CharField(max_length=100)
    location_number = models.IntegerField()

    def __str__(self):
        return self.location_city + " " + self.location_street + " " + str(self.location_number)
    
class HallTypes(models.Model):
    hall_type = models.CharField(max_length=100)

    def __str__(self):
        return self.hall_type

class CinemaHalls(models.Model):
    hall_number = models.IntegerField()
    cinema = models.ForeignKey(Cinemas, on_delete=models.CASCADE)
    type = models.ManyToManyField(HallTypes, blank=False)

    def __str__(self):
        return str(self.cinema) + " " + str(self.hall_number)

class Seats(models.Model):
    row = models.IntegerField()
    number = models.IntegerField()
    hall = models.ForeignKey(CinemaHalls, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.hall) + " " + str(self.row) + " " + str(self.number)

class Movies(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    release_date = models.DateField()
    duration = models.IntegerField()

    def __str__(self):
        return self.title

class MovieShowings(models.Model):
    date = models.DateField()
    showing_type = models.ForeignKey(HallTypes, null=True, on_delete=models.SET_NULL)
    movie = models.ForeignKey(Movies, null=True, on_delete=models.SET_NULL)
    hall = models.ForeignKey(CinemaHalls, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return str(self.movie) + " " + str(self.date) + " " + str(self.type) + " " + str(self.hall)
    
class Tickets(models.Model):
    base_price = models.FloatField()
    showing = models.ForeignKey(MovieShowings, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seats, on_delete=models.CASCADE)
    purchase_time = models.DateTimeField(auto_now_add=True)
    purchase_price = models.FloatField()
    buyer = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Ticket {self.id}"

    
class Artists(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class MovieCrews(models.Model):
    director = models.ForeignKey(Artists, on_delete=models.CASCADE, related_name='director')
    main_lead = models.ManyToManyField(Artists, blank=True, related_name='main_lead')

    def __str__(self):
        return f"Crew {self.id} Director {str(self.director)}"