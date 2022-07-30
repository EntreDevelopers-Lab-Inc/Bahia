from flask import Blueprint, render_template

pool = Blueprint('pool', __name__)


@pool.route('/')
def home():
    # find a way to only show connect wallet if they are connected
    return render_template('pool/home.html')


@pool.route('/whitepaper')
def whitepaper():
    return render_template('pool/whitepaper.html', title='Whitepaper')


@pool.route('/start')
def start():
    return render_template('pool/start.html', title='Start', mustache=True, dapp=True)


@pool.route('/join')
def join():
    return render_template('pool/join.html', title='Join', mustache=True, dapp=True)


@pool.route('/my-pools')
def my_pools():
    return render_template('pool/my-pools.html', title='My Pools', mustache=True, dapp=True)
