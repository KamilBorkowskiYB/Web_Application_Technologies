from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('cinemas', CinemaViewSet, basename='cinemas')
router.register('hall_types', HallTypeViewSet, basename='hall_types')
router.register('cinema_halls', CinemaHallViewSet, basename='cinema_halls')
router.register('seats', SeatViewSet, basename='seats')
router.register('movies', MovieViewSet, basename='movies')
router.register('movie_showings', MovieShowingViewSet, basename='movie_showings')
router.register('tickets', TicketViewSet, basename='tickets')
router.register('artists', ArtistViewSet, basename='artists')
router.register('movie_crews', MovieCrewViewSet, basename='movie_crews')
router.register('genres', GenreViewSet, basename='genres')
router.register('ticket_discounts', TicketDiscountViewSet, basename='ticket_discounts')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/google-redirect/', google_login_redirect, name='google_login_redirect'),
]