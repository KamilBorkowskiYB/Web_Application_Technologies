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
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    email = models.EmailField()

    def __str__(self):
        return f"Order {self.id} - Status: {self.status}"
    
    def cancel(self):
        for ticket in self.tickets.all():
            ticket.cancelled = True
            ticket.save()
        self.save()