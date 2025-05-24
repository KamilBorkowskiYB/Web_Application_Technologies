from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('', OrderViewSet, basename='orders')

urlpatterns = [
    path('change_order_status/', change_status, name='change_order_status'),
    path('', include(router.urls)),
]