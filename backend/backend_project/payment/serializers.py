from rest_framework import serializers
from .models import Order, PaymentStatus
from cinema_api.serializers import TicketSerializer
from cinema_api.models import Ticket

class PaymentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentStatus
        fields = ['id', 'label']
        read_only_fields = ['id', 'label']

class OrderSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)
    tickets_ids = serializers.PrimaryKeyRelatedField(
        queryset=Ticket.objects.all(),
        source='tickets',
        many=True,
        write_only=True
    )
    status = PaymentStatusSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'status', 'amount']

    def create(self, validated_data):
        tickets = validated_data.pop('tickets')
        validated_data['amount'] = sum(ticket.purchase_price for ticket in tickets)
        validated_data['status'] = PaymentStatus.objects.get(label='Pending')
        order = Order.objects.create(**validated_data)
        order.tickets.set(tickets)
        return order