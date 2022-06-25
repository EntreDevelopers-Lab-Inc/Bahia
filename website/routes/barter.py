from flask import Blueprint, render_template, redirect, url_for

barter = Blueprint('barter', __name__)


@barter.route('/')
def home():
    # find a way to only show connect wallet if they are connected
    return render_template('barter/home.html')


@barter.route('/whitepaper')
def whitepaper():
    return render_template('barter/whitepaper.html', title='Whitepaper')


@barter.route('/buy')
def buy():
    return render_template('barter/buy.html', title='Buy', mustache=True, dapp=True)


@barter.route('/sell')
def sell():
    return render_template('barter/sell.html', title='Sell', mustache=True, dapp=True)
