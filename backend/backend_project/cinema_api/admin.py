from django.contrib import admin
from django.contrib import messages
from .utils import seat_generation
from django.urls import path
from django.shortcuts import redirect, get_list_or_404, render
from .models import *
from .forms import CinemaHallForm

# Register your models here.
admin.site.register(Cinema)
admin.site.register(HallType)
admin.site.register(Seat)
admin.site.register(Movie)
admin.site.register(MovieShowing)
admin.site.register(Ticket)
admin.site.register(MovieCrew)

@admin.register(CinemaHall)
class CinemaHallAdmin(admin.ModelAdmin):

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                '<int:hall_id>/generate_seats/',
                self.admin_site.admin_view(self.generate_seats_view),
                name='generate_seats',
            )
        ]
        return custom + urls
    
    def generate_seats_view(self, request, hall_id):
        hall = get_list_or_404(CinemaHall, id=hall_id)[0]
        
        if request.method == 'POST':
            form = CinemaHallForm(request.POST)
            if form.is_valid():
                number_of_rows = form.cleaned_data['number_of_rows']
                seats_per_row = form.cleaned_data['seats_per_row']
                seat_generation(hall, number_of_rows, seats_per_row)
                self.message_user(request, "Seats generated successfully.", messages.SUCCESS)
                return redirect(f'../../{hall_id}/change/')
        else:
            form = CinemaHallForm()

        return render(request, 'admin/generate_seats.html', {'form': form, 'hall': hall})