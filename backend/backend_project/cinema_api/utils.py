from .models import CinemaHall, Seat
import qrcode
import json
from io import BytesIO
from django.core.files.base import ContentFile
from .serializers import MovieSerializer

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

def movie_qr_code(movie):
    serializer_movie = MovieSerializer(movie)
    movie_data = serializer_movie.data
    movie_json = json.dumps({'id': movie.id})
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(movie_json)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    return ContentFile(img_io.getvalue(), name=f"{movie.title}_qr.png")