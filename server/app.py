import json
from models import SavedFlight
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import User, db
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from main import search_flights
import os

load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///flaskdb.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', '1T}nqy(?Y?%!c]{')
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

#origins - value should be the server for React
CORS(app, supports_credentials=True, resources={r"*": {"origins": "http://localhost:3000"}})

bcrypt = Bcrypt(app)
db.init_app(app)

with app.app_context():
    db.create_all()


@app.route('/check_session', methods=['GET'])
def check_session():
    email = session.get('email')  # Get email from the session
    if email:
        return jsonify({'status': 'logged in', 'email': email}), 200
    return jsonify({'status': 'not logged in'}), 401


@app.route('/registration', methods=['POST'])
def signup():
    email = request.json.get('email')
    password = request.json.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user_exists = User.query.filter_by(email=email).first()
    if user_exists:
        return jsonify({'error': 'Email already exists.'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'id': new_user.id,
        'email': new_user.email
    })


@app.route('/login', methods=['POST'])
def login_user():
    data = request.json  # Get JSON data from request
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()

    if user is None or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Unauthorized'}), 401

    session['user_id'] = user.id  # Store user ID in the session
    session['email'] = user.email  # Store email in the session
    print(f'Session data after login: {session}')
    return jsonify({'status': 'success', 'message': 'Logged in successfully', 'email': user.email}), 200

@app.route('/logout', methods=['POST'])
def logout_user():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/profile', methods=['GET'])
def profile():
    user_id = session.get('user_id')
    print("user_id", user_id)  # Debugging statement
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({'email': user.email}), 200
    return jsonify({'error': 'User not logged in'}), 401



@app.route('/searchFlights', methods=['POST'])
def search_flights_route():
    data = request.json
    print("Received data:", data)

    try:
        result = search_flights(
            data['sourceAirportCode'],
            data['destinationAirportCode'],
            data['date'],
            data['returnDate'],
            data['itineraryType'],
            data['sortOrder'],
            data['numAdults'],
            data['numSeniors'],
            data['classOfService']
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/saveFlights', methods=['POST'])
def save_flights():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401

    data = request.json
    flights = data.get('flights', [])

    if not flights:
        return jsonify({'error': 'No flights to save'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    for flight in flights:
        flight_info = json.dumps(flight)  # Convert flight info to JSON string
        new_saved_flight = SavedFlight(user_id=user_id, flight_info=flight_info)
        db.session.add(new_saved_flight)

    db.session.commit()

    return jsonify({'message': 'Flights saved successfully'}), 200

@app.route('/savedFlights', methods=['GET'])
def get_saved_flights():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    flights = [json.loads(flight.flight_info) for flight in user.saved_flights]  # Convert JSON strings back to dictionaries
    return jsonify({'flights': flights}), 200


if __name__ == '__main__':
    app.run(port=3002)
