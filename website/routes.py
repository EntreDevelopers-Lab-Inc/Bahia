from website import app
from flask import render_template


@app.route('/home')
@app.route('/')
def home():
    # find a way to only show connect wallet if they are connected
    return render_template('home.html')


@app.route('/buy')
def buy():
    return render_template('sell.html', mustache=True, dapp=True)


@app.route('/sell')
def sell():
    return render_template('sell.html', mustache=True, dapp=True)
