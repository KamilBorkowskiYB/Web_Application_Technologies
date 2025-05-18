import requests
import environ
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(env_file=os.path.join(BASE_DIR, '..', '..', '.env'))


shop_id = "490967"


ticket_id = "7"
price = 2499 # cena w groszach

token = None

if token is None:
    url = "https://secure.snd.payu.com/pl/standard/user/oauth/authorize"
    payload = {
        "grant_type": "client_credentials",
        "client_id": env("PAYU_CLIENT_ID"),
        "client_secret": env("PAYU_CLIENT_SECRET"),
    }

    response = requests.post(url, data=payload).json()
    print(response)
    token = response["access_token"]

url = "https://secure.snd.payu.com/api/v2_1/orders"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

payload = {
    "continueUrl": "http://20.117.241.29",
    # "notifyUrl": "http://cinemaland.com/payment/notify",
    "customerIp": "127.0.0.1",
    "merchantPosId": shop_id,
    "description": f"Ticket: {ticket_id}",
    "currencyCode": "PLN",
    "extOrderId": f"Ticket Order: {ticket_id}",
    "totalAmount": price,
    "buyer": {
        "extCustomerId": "cust_12345",
        "email": "client@cinemaland.com",
        "phone": "654111654",
        "firstName": "John",
        "lastName": "Doe",
        "language": "pl",
    },
    "products": [
        {
            "name": f"Ticket: {ticket_id}",
            "unitPrice": price,
            "quantity": 1,
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)

print("Status code:", response.status_code)
