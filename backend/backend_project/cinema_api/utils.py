from .models import CinemaHall, Seat
import qrcode
import json
from io import BytesIO
from django.core.files.base import ContentFile
from firebase_admin import messaging
from time import sleep
from .serializers import MovieSerializer
from .models import UserDevice

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

def notify_all(movie):
    """Notify all registered devices about a new movie."""
    batch_size = 1000
    device_tokens = list(UserDevice.objects.values_list('fcm_token', flat=True))

    print(f"Found {len(device_tokens)} tokens.")

    for i in range(0, len(device_tokens), batch_size):
        token_batch = device_tokens[i:i + batch_size]

        for token in token_batch:
            if not token:
                continue

            message = messaging.Message(
                notification=messaging.Notification(
                    title=f"Nowy film: {movie.title}",
                    body=f"{movie.title} już w kinach!",
                ),
                token=token,
            )

            try:
                response = messaging.send(message)
                print(f"Wysłano do {token}: {response}")
            except Exception as e:
                print(f"Błąd wysyłania do {token}: {e}")

        sleep(1)