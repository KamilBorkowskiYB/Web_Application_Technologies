from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Cinema)
admin.site.register(HallType)
admin.site.register(CinemaHall)
admin.site.register(Seat)
admin.site.register(Movie)
admin.site.register(MovieShowing)
admin.site.register(Ticket)
admin.site.register(MovieCrew)