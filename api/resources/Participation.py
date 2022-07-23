from api.site_secrets import RINKEBY_WEBHOOK_AUTH
from api.models import db, ParticipationModel, object_as_dict
from api.resources import load_json
from api.tools.pool import POOL_CONTRACT
from flask_restful import Resource
from flask import request


class BaseParticipationResource(Resource):
    network = 0  # a fake network

    # make a way to push
    def post(self):
        data = load_json()

        # print the data (until it is live)
        print(data)

        # get the function input
        function, input_data = POOL_CONTRACT.decode_function_input(
            data['input'])

        # if it is not our webhook, deny it
        if (data['apiKey'] != RINKEBY_WEBHOOK_AUTH):
            return {'message': 'write access not permitted'}, 401

        # if the function name is not joinging the pool, just return
        if (function.fn_name != 'joinPool') or (data['status'] != 'confirmed'):
            return {'status': f"no computation necessary (function: {function.fn_name})"}, 202

        # if the participation exists, exit
        if ParticipationModel.query.filter_by(transaction_hash=data['hash']).first():
            return {'status': 'already added participation'}, 203

        # log a new partipation if it does not exist
        participation = ParticipationModel(
            network=self.network, transaction_hash=data['hash'], address=data['from'].lower(), pool_id=input_data['poolId'])

        # add the participation to the database
        db.session.add(participation)
        db.session.commit()

        return {'status': 'success'}, 201

    # a way to get information (can build pagination in later)
    def get(self):
        # get the address
        address = request.headers.get('address')

        # if there is no address return that this is a bad request
        if not address:
            return {'status': 'failed', 'message': 'Must include request'}, 400

        # get all the pools at the address is a part of
        pools = [object_as_dict(pool) for pool in ParticipationModel.query.filter_by(
            address=address.lower()).all()]

        # return the pools
        return {'status': 'success', 'data': pools}, 201


# make a mainnet resource
class MainnetParticipationResource(BaseParticipationResource):
    network = 1


# make a rinkeby resource
class RinkebyParticipationResource(BaseParticipationResource):
    network = 4
