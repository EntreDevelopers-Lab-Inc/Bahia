from flask import request
from api import app
import json


def load_json(given_json=None):
    try:
        json_data = json.loads(request.get_json(force=True))
    except TypeError:
        json_data = request.get_json(force=True)

    return json_data
