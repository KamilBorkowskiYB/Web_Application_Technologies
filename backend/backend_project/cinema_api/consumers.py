import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ShowConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.show_id = self.scope['url_route']['kwargs']['show_id']
        self.group_name = f'show_{self.show_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        pass

    async def ticket_booked(self, event):
        print(f"Ticket update received in consumer: {event}")
        await self.send(text_data=json.dumps({
            'type': 'ticket_booked',
            'data': event['data']
        }))

    async def ticket_cancelled(self, event):
        print(f"Ticket cancellation received in consumer: {event}")
        await self.send(text_data=json.dumps({
            'type': 'ticket_cancelled',
            'data': event['data']
        }))
