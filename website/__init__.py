from flask import Flask
from flask_cors import CORS
import random
import string

app = Flask(__name__)

# run it!
CORS(app, supports_credentials=True)
from website.routes.barter import barter
from website.routes.pool import pool

app.register_blueprint(barter, url_prefix='/barter')
app.register_blueprint(pool, url_prefix='/pool')

if __name__ == '__main__':
    app.run(threaded=True)
