from celery import shared_task
from .utils import notify_user
from .models import Ticket

@shared_task
def send_notification_to_user(ticket_id):
    ticket = Ticket.objects.get(id=ticket_id)
    if not ticket.buyer:
        print(f"Ticket {ticket.id} has no buyer, skipping notification.")
        return
    print(f"Sending notification for ticket {ticket.id} to user {ticket.buyer.username}")
    notify_user(ticket)
    