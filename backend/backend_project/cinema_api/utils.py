from .models import CinemaHall, Seat
import qrcode
import json
from io import BytesIO
from django.core.files.base import ContentFile
from firebase_admin import messaging
from time import sleep
from .serializers import MovieSerializer
from .models import UserDevice
from zoneinfo import ZoneInfo

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

def notify_user(ticket):
    """Notify a user devices about incoming movie showing."""
    if not ticket.showing.movie:
        print("No movie associated with this showing.")
        return

    movie = ticket.showing.movie
    poster_url = "https://cinemaland.pl" + movie.poster.url if movie.poster else None
    user_devices = UserDevice.objects.filter(user=ticket.buyer)

    if not user_devices.exists():
        print(f"No devices registered for user {ticket.buyer.username}.")
        return

    for device in user_devices:
        if not device.fcm_token:
            print(f"No FCM token for device {device.id}.")
            continue

        local_time = ticket.showing.date.astimezone(ZoneInfo("Europe/Warsaw"))

        message = messaging.Message(
            notification=messaging.Notification(
                title=f"Seans filmu: {movie.title}",
                body=f"{movie.title} zaczyna się o {local_time.strftime('%H:%M')} w kinie {ticket.showing.hall.cinema.name}.",
                image=poster_url,
            ),
            token=device.fcm_token,
        )


        try:
            response = messaging.send(message)
            print(f"Wysłano do {device.fcm_token}: {response}")
        except Exception as e:
            print(f"Błąd wysyłania do {device.fcm_token}: {e}")

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
                    image="https://cinemaland.pl" + movie.poster.url if movie.poster else None,
                ),
                token=token,
            )

            try:
                response = messaging.send(message)
                print(f"Wysłano do {token}: {response}")
            except Exception as e:
                print(f"Błąd wysyłania do {token}: {e}")

        sleep(1)