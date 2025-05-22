import requests
import environ
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(env_file=os.path.join(BASE_DIR, '..', '..', '.env'))


shop_id = "490967"


ticket_id = "17"
price = 2499 # cena w groszach



def get_url(order):
    token = None
    print("Getting URL for order:", order.id)
    if token is None:
        url = "https://secure.snd.payu.com/pl/standard/user/oauth/authorize"
        payload = {
            "grant_type": "client_credentials",
            "client_id": env("PAYU_CLIENT_ID"),
            "client_secret": env("PAYU_CLIENT_SECRET"),
        }

        response = requests.post(url, data=payload).json()
        token = response.get("access_token")
    print("token:", token)
    url = "https://secure.snd.payu.com/api/v2_1/orders"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    payload = {
        "continueUrl": "https://cinemaland.pl/",
        "notifyUrl": f"https://d490-185-152-123-92.ngrok-free.app/api/orders/change_order_status/",
        "customerIp": "127.0.0.1",
        "merchantPosId": shop_id,
        "description": f"Order: {order.id}",
        "currencyCode": "PLN",
        "extOrderId": f"Ticket Order: {order.id}",
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
                "name": f"Ticket: {order.tickets.first()}",
                "unitPrice": int(order.tickets.first().purchase_price),
                "quantity": 1,
            }
        ]
    }
    response = requests.post(url, headers=headers, json=payload, allow_redirects=False)

    print("Status code:", response.status_code)
    print("Response JSON:", response.json())
    return response.json()