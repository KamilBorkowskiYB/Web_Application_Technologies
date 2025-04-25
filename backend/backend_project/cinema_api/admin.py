from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Cinemas)
admin.site.register(HallTypes)
admin.site.register(CinemaHalls)
admin.site.register(Seats)
admin.site.register(Movies)
admin.site.register(MovieShowings)
admin.site.register(Tickets)
admin.site.register(MovieCrews)