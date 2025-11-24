## Przebieg deploy

- Pobiera repo
- Uruchamia dockera
- Buduje obrazy w folderze cinema_images.tar
- zmienia chmod 644, żeby móć go przerzucić
- wyświetla pliki i permisje chmoda (Debug)
- kopiuje folder obrazów na serwer
- sprawdza czy się skopiowało (Debug)
- kopiuje compose.prod.up.yaml na serwer, żeby móc za jego pomocą postawić obrazy
- kopiuje .enva na serwer (z github secrets), żeby backend miał z czego brać dane (frontend korzysta z .env podczas buildu, w kroku trzecim build nie ma dostępu do .enva, potrzebne dane są przekazane do frontu przez github secrets)
- ładujemy obrazy z folderu cinema_images.tar, wyłączamy kontenery, usuwamy stare obrazy, stawiamy nowe obrazy skopiowanym compose.prod.up.yaml

- czekamy aż backend będzie miał status running, puszczamy python manage.py migrate wewnątrz kontenera backednu (migrate)

## Komendy

- actions/checkout@v3 - pobiera komita
- docker/setup-buildx-action@v3 - docker buid
- appleboy/scp-action@v0.1.7 - wysyła pliki na serwer przez SCP (secure copy)
- appleboy/ssh-action@v1.0.3 - wykonuje komendy na serwerze

## Composy

- compose.yaml - do budowania kontenerów
- compose.prod.up.yaml - do startowania kontenerów na prodzie, różni się od compose.yaml tym, że nie ma ścieżek build (nawet na prodzie budujemy zwykłym compose.yaml) i front jest okrojony z hot reload i danych z .env (bo korzysta z nich tylko podczas builda)
- compose.override.yaml - artefakt, staroć, do wyrzucenia

## Google

- W google cloud platform trzeba:
    * założyć konto
    * zrobić projekt
    * ustawić uwierzytelnianie Oauth
    * podać w URI https://cinemaland.pl/accounts/google/login/callback/
- W adminie Django:
    * podać w sites cinemaland.pl
    * w social apps podać secret key i client id z google cloud platform (tam gdzie się ustawiało URI)
- W backendie settings.py
    * ustawić SITE_ID na takie jakie ma google w social apps (jedynie da się sprawdzić przez "zbadaj element" konsoli)
    * ustawić LOGIN_REDIRECT_URL na adres, gdzie ma przekierować po zalogowaniu przez google (u nas f"{BACKEND_URL}/api/google-redirect")


