from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
import json
from datetime import datetime

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    saved_flights = db.relationship('SavedFlight', backref='user', lazy=True)

class SavedFlight(db.Model):
    __tablename__ = 'saved_flights'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('users.id'), nullable=False)
    flight_info = db.Column(db.Text, nullable=False)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
