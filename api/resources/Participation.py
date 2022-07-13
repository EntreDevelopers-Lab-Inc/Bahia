from api.models import ParticipationModel
from api.resources import load_json
from flask_restful import Resource


class BaseParticipationResource(Resource):
    network = 0  # a fake network

    # make a way to push
    def post(self):
        data = load_json()

        # turn the input into a pool id
        pool_id = ''

        # log a new partipation
        participation = ParticipationModel(
            network=self.network, transaction_hash=data['hash'], address=data['from'], pool_id=pool_id)


# make a mainnet resource
class MainnetParticipationResource(BaseParticipationResource):
    network = 1


# make a rinkeby resource
class RinkebyParticipationResource(BaseParticipationResource):
    network = 4
