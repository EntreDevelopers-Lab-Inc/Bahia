from api import db

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
