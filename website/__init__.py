from flask import Flask
from flask_cors import CORS
import random
import string

app = Flask(__name__)

# run it!
CORS(app, supports_credentials=True)
from website.routes.barter import barter

app.register_blueprint(barter, url_prefix='/barter')

if __name__ == '__main__':
    app.run(threaded=True)
