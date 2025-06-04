from django.core.mail import send_mail
from django.conf import settings

def send_email(order):
    print("Sending confirmation email...")
    text_content = 'Dziękujemy za zamówienie biletów. Oto tokółko zamówienia:\n\n'
    for ticket in order.tickets.all():
        text_content += f'Ticket ID: {ticket.id}, Movie: {ticket.showing.movie.title}, Show Time: {ticket.showing.movie.duration}\n'
    text_content += f'\nŁączna kwota: {order.amount} PLN\n'
    send_mail(
        'Zamówienie biletów',
        text_content,
        settings.EMAIL_HOST_USER,
        [order.email,]
    )