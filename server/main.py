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


def search_hotels(geo_id, check_in, check_out, adults, rooms, rating):

    url = "https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotels"
    query_params = {
        "pageNumber": 1,
        "currencyCode": "USD",
        "geoId": geo_id,
        "checkIn": check_in,
        "checkOut": check_out,
        "adults": adults,
        "rooms": rooms,
        "rating": rating
    }

    headers = {
        "x-rapidapi-key": os.getenv('RAPIDAPI_KEY'),
        "x-rapidapi-host": "tripadvisor16.p.rapidapi.com"
    }

    print("Making request to TripAdvisor API with the following parameters:")
    print(query_params)

    # Making the GET request to the API
    response = requests.get(url, headers=headers, params=query_params)

    print("Response status code:", response.status_code)
    print("Response text:", response.text)

    # Checking if the request was successful
    if response.status_code == 200:
        json_data = response.json()
        hotels_list = json_data.get('data', {}).get('data', [])

        hotels_info = []
        for hotel in hotels_list:
            hotel_info = {
                'id': hotel.get('id'),
                'title': hotel.get('title'),
                'rating': hotel.get('bubbleRating', {}).get('rating'),
                'price': hotel.get('priceForDisplay'),
                'location': hotel.get('secondaryInfo'),
                'photos': [photo.get('sizes', {}).get('urlTemplate') for photo in hotel.get('cardPhotos', [])]
            }
            hotels_info.append(hotel_info)
        return hotels_info
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")


# Testing hotel search endpoint + json parsing
# geo_id = "34438"
# check_in = "2024-08-01"
# check_out = "2024-08-11"
# adults = 2
# rooms = 1
# rating = 4
#
# hotels = search_hotels(geo_id, check_in, check_out, adults, rooms, rating)
# print(hotels)
