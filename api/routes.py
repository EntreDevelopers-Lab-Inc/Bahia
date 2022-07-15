from flask_restful import Api
from api import app
from api.resources.Participation import MainnetParticipationResource, RinkebyParticipationResource

api = Api(app)


@app.route('/')
def home():
    return 'The API is live!'


# add routes
api.add_resource(MainnetParticipationResource, '/pool/Participation')
api.add_resource(RinkebyParticipationResource, '/rinkeby/pool/Participation')
