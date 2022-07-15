from api.models import db, ParticipationModel
from api.resources import load_json
from api.tools.pool import POOL_CONTRACT
from flask_restful import Resource


class BaseParticipationResource(Resource):
    network = 0  # a fake network

    # make a way to push
    def post(self):
        data = load_json()

        # get the function input
        function, input_data = POOL_CONTRACT.decode_function_input(
            data['input'])

        # if the function name is not joinging the pool, just return
        if function.fn_name != 'joinPool':
            return {'status': 'no computation necessary'}, 202

        # if the participation exists, exit
        if ParticipationModel.query.filter_by(transaction_hash=data['hash']).first():
            return {'status': 'already added participation'}, 203

        # log a new partipation if it does not exist
        participation = ParticipationModel(
            network=self.network, transaction_hash=data['hash'], address=data['from'], pool_id=input_data['poolId'])

        # add the participation to the database
        db.session.add(participation)
        db.session.commit()

        return {'status': 'success'}, 201


# make a mainnet resource
class MainnetParticipationResource(BaseParticipationResource):
    network = 1


# make a rinkeby resource
class RinkebyParticipationResource(BaseParticipationResource):
    network = 4
