from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Ticket

import logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=Ticket)
def ticket_booked(sender, instance, created, **kwargs):
    logger.info(f"In signal: {instance} {created}")
    """
    Signal to handle ticket booking.
    """
    if created:
        logger.info(f"Ticket booked: seat {instance.seat.id} for showing {instance.showing.id}")
        # Notify the group about the booked ticket
        channel_layer = get_channel_layer()
        group_name = f'show_{instance.showing.id}'
        data = {
            'ticket_id': instance.id,
            'showing_id': instance.showing.id,
            'seat_id': instance.seat.id,
        }
        async_to_sync(channel_layer.group_send)(
            f'show_{instance.showing.id}',
            {
                'type': 'ticket_booked',
                'data': data,
            }
        )