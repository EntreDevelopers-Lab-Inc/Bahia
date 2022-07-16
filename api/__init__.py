#from site_secrets import SECRET_KEY, SQLALCHEMY_DATABASE_URI
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


app = Flask(__name__)
CORS(app, supports_credentials=True)

'''app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
'''
# need to enable with this: https://askubuntu.com/questions/1222935/apache-flask-permission-denied-writing-to-var-www-even-though-the-folders-are

db = SQLAlchemy(app)

# run it!
from api import routes
