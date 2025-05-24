from django_filters import rest_framework as filters
from django.contrib.auth.models import User
from .models import Order

class OrderFilter(filters.FilterSet):
    user = filters.ModelChoiceFilter(queryset=User.objects.all())
    status = filters.CharFilter(field_name='status__label', lookup_expr='icontains')

    class Meta:
        model = Order
        fields = ['user', 'status']