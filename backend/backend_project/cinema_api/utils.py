from .models import CinemaHall, Seat

def seat_generation(hall: CinemaHall, row_count, seat_per_row):
    if Seat.objects.filter(hall=hall).exists():
        raise ValueError("Seats already exist for this hall.")
    if row_count <= 0 or seat_per_row <= 0:
        raise ValueError("Row count and seat per row must be greater than 0.")

    seats = []
    for i in range(row_count):
        for j in range(seat_per_row):
            seats.append(Seat(hall=hall, row=i+1, number=j+1))
    Seat.objects.bulk_create(seats)