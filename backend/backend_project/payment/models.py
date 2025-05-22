from django.db import models
from cinema_api.models import Ticket

# Create your models here.
class PaymentStatus(models.Model):
    label = models.CharField(max_length=255)
    def __str__(self):
        return self.label

class Order(models.Model):
    tickets = models.ManyToManyField(Ticket, blank=False)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.ForeignKey(PaymentStatus, on_delete=models.CASCADE)

    def __str__(self):
        return f"Order {self.id} - Status: {self.status}"