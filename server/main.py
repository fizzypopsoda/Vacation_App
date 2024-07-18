import os
import requests
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file


def search_flights(sourceAirportCode, destinationAirportCode, date, returnDate, itineraryType, sortOrder, numAdults,
                   numSeniors, classOfService):
    url = "https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights"

    querystring = {
        "sourceAirportCode": sourceAirportCode,
        "destinationAirportCode": destinationAirportCode,
        "date": date,
        "returnDate": returnDate,
        "itineraryType": itineraryType,
        "sortOrder": sortOrder,
        "numAdults": numAdults,
        "numSeniors": numSeniors,
        "classOfService": classOfService,
    }

    headers = {
        "x-rapidapi-key": os.getenv('RAPIDAPI_KEY'),
        "x-rapidapi-host": "tripadvisor16.p.rapidapi.com"
    }

    print("Making request to TripAdvisor API with the following parameters:")
    print(querystring)

    response = requests.get(url, headers=headers, params=querystring)

    print("Response status code:", response.status_code)
    print("Response text:", response.text)

    if response.status_code == 200:
        json_data = response.json()
        flights = json_data.get('data', {}).get('flights', [])

        purchase_links = []
        for flight in flights:
            for link in flight.get('purchaseLinks', []):
                purchase_links.append({
                    'providerId': link['providerId'],
                    'totalPrice': link['totalPrice'],
                    'url': link['url']
                })

        return purchase_links
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")