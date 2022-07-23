from api import db
from datetime import datetime as dt


# create the participation model
class ParticipationModel(db.Model):
    __tablename__ = 'participations'
    id = db.Column(db.Integer, primary_key=True)

    # query information
    network = db.Column(db.Integer, nullable=False)
    # don't want to store duplicate transactions
    transaction_hash = db.Column(db.String(70), unique=True, nullable=False)
    address = db.Column(db.String(50), nullable=False)
    pool_id = db.Column(db.Integer, nullable=False)


# create a function to handle datetimes
def check_dt(value):
    if isinstance(value, dt):
        value = value.strftime('%s')

    return value


# convert object to dictionary
def object_as_dict(obj):
    obj_dict = {c.key: getattr(obj, c.key)
                for c in db.inspect(obj).mapper.column_attrs}

    # format datetimes
    obj_dict = {key: check_dt(value) for key, value in obj_dict.items()}
    return obj_dict
