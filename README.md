# TAI PROJECT

Pamiętajcie, żeby być na swoim branchu

## Frontend odpalamy komendą:
```
yarn start
```
w folderze frontend
http://localhost:3000

## Backend odpalamy komendami:
```
venv\Scripts\activate
pip install -r requirements.txt 
python manage.py migrate 
python manage.py runserver 
```
w folderze backend/backend_project (NIE w backend/backend_project/backend_project)
http://127.0.0.1:8000/

Prace terminala nad backendem powinny być przeprowadzane tylko w venv'ie (po użyciu venv\Scripts\activate). Linie terminala powinny zaczynać się od (venv)
Jeśli trzeba coś pobrać do backendu, to w venvie i zapisać komendą:
```
freeze > requirements.txt
```