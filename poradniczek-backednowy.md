# Co właściwie dzieje się na backendzie? [WIP]
W sumie to sam bym chciał to wiedzieć. Wychodzi na to, że komentarze to całkiem użyteczna rzecz.

Mam widoczne za dużo wolnego czasu, więc chcę zrobić jakiś ładny plik. Zakładam, że każdy miał jakieś doczynienie z Django z bibliotkę do [REST API](https://www.django-rest-framework.org/). Jak nie, to odpalcie sobie najkrótszy filmik na YT o tym i pewnie załapiecie podstawy znając działanie REST API.

Za dużo będzie opisywania wszystkiego (wierzę, że ludzie u Stanika wyciągneli by z tego 80 stron inżynierki), więc raczej skupię się na elementach, które odstają od ogólnej logiki i mogą być średnio zrozumiałe.

## Krótki opis modeli i zapytań do nich
Skupiam się na tych dziwiniejszych fragmentach.
### Cinema
### HallType
### CinemaHall
Do modelu dodaję klasę Meta, która umożliwia nakładanie dodatkowych ustawień na klasę. W tym przypadku nakładam wymaganie, by była tylko jedna sala w kinie z przekazanym numerem.
``` python
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=['cinema', 'hall_number'], 
            name='unique_cinema_hall')
]
```

W serializerze tworzę kilka dodatkowych pól:
``` python
class CinemaHallSerializer(serializers.ModelSerializer):
    cinema = serializers.PrimaryKeyRelatedField(queryset=Cinema.objects.all())
    types = serializers.PrimaryKeyRelatedField(
        queryset=HallType.objects.all(),
        many=True
    )
    hall_number = serializers.IntegerField(read_only=True)
```
`cinema` i `types` umożliwiają połączenie z odpowiednimi modelami po ich kluczu głównym. Przy serializacji będzie widoczne tylko id, bez reszty danych. `hall_number` jest polem serializera odnoszącym się do analogicznego pola z modelu(działa to tak, jeżeli mamy te same nazwy). Jest uzupełniane w metodzie `create()` wartością następnej sali, która może pojawić się w danym kinie.
### Seat
### Artist
### MovieCrew
### Genre
### Movie
W serializerze mamy kilka dodatkowych pól:
``` python
class MovieSerializer(serializers.ModelSerializer):
    crew = serializers.PrimaryKeyRelatedField(
        queryset=MovieCrew.objects.all(),
    )
    genre = GenreSerializer(
        many=True,
        read_only=True)
    genre_id = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), 
        many=True,
        write_only=True,
        source='genre'
    )
```
Oprócz standardowego dodawnia pól do obsługi kluczy obcych jest też pole `genre`, które wykorzystuje wcześniej zdefiniowany serializer, żeby podczas wyświetlania widzieć całą zawartość serializera gatunku, a nie tylko jego id. Używając `genre_id` możemy za to dodawać elementy tylko z wykorzystaniem id, bez potrzeby wrzucania reszty danych gatunku do serializera. W tej samej klasie mamy też walidację danych, które otrzymuje serializer i wyrzucanie błędów, jeżeli coś jest nie tak.

### MovieShowing
Definicja ma metodę `clean()`, która sprawdza dane przed dodaniem do bazy danych. Wywala błędy, jeżeli data będzie w przeszłości lub typ seansu nie zgadza się z typami dostępnymi w sali.
### TicketDiscount
Podobnie jak wyżej - `clean()` sprawdza poprawność dat przed dodaniem do bazy danych.
### Ticket
Klasa `Meta` w modelu powiązuje ze sobą pokaz i miejsce, żeby nie mieć przypadku wielu biletów na to samo miejsce na jeden seans.

Metoda `clean()` sprawdza czy id sali w obiekcie krzesełka i pokazu jest takie same oraz sprawdza czy nie ma już takiego biletu(miejsce, seans) w bazie danych(co właściwie nie jest już potrzebne bo mamy wymaganie unikalności nałożone w `Meta` I guess?)
# Rzeczy które fajnie by było dodać 
- rozróżnianie użytkowników na normalnych, pracowników i adminów
- oznaczanie filmów jako zakończone do odtwarzania
- może wystarczy autoryzacja przez logowanie użytkownika? nie wiem jak z bezpieczeństwem tego rozwiązania po stronie frontendu
- coś jeszcze na pewno się pojawi, nawet żeby przećwiczyć wymysły Kapałki 