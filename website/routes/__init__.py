from website import app
from flask import render_template


@app.route('/')
def home():
    # find a way to only show connect wallet if they are connected
    return render_template('home.html')