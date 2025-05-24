from django.contrib import admin
from .models import Order, PaymentStatus
# Register your models here.
admin.site.register(Order)
admin.site.register(PaymentStatus)
