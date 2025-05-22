from django.shortcuts import render
from .models import Order, PaymentStatus
from .serializers import OrderSerializer
from rest_framework import viewsets
from .payment_logic import get_url
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def change_status(request):
    order_data = request.data.get('order')
    ext_order_id = order_data.get('extOrderId')
    status = order_data.get('status').capitalize()
    print(request.data)
    
    print("External order ID:", ext_order_id)
    print("Payment status:", status)

    if not ext_order_id or not status:
        print("Invalid data:")
        return Response({'error': 'Invalid data'}, status=400)
    try:
        order_id = int(ext_order_id.replace("Ticket Order: ", ""))
        order = Order.objects.get(id=order_id)
    except (ValueError, Order.DoesNotExist):
        print("Order not found")
        return Response({'error': 'Order not found'}, status=404)
    
    try:
        payment_status = PaymentStatus.objects.get(label=status)
        order.status = payment_status
        order.save()
    except PaymentStatus.DoesNotExist:
        print("Payment status not found")
        return Response({'error': 'Payment status not found'}, status=404)
    
    print("Order status updated:", order.status)
    return Response({'message': 'Payment status updated successfully'}, status=200)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        payment_request = get_url(order)
        payment_url = payment_request.get('redirectUri')
        payment_id = payment_request.get('orderId')
        return Response({
            'order': serializer.data,
            'payment_id': payment_id,
            'payment_url': payment_url
        }, status=201)