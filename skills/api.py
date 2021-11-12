from typing import Any

from flask import Blueprint, Flask, request
from flask_restplus import Api, Resource, reqparse  # type: ignore
from jsonschema import FormatChecker
from sqlalchemy.sql.expression import func

from skills.schema import Belt, session_context

api_blueprint = Blueprint('api', __name__)
api = Api(
    api_blueprint,
    title='Skills API',
    format_checker=FormatChecker(),
    base_url='/api',
)

belts_ns = api.namespace('belts', path='/')


@belts_ns.route('/belts')
class BeltsResource(Resource):
    def get(self) -> Any:
        with session_context() as session:
            return [
                belt.json()
                for belt in session.query(Belt)
            ]

    argparser = reqparse.RequestParser()
    argparser.add_argument('name', location='args', required=True)

    @api.expect(argparser)
    def post(self) -> Any:
        with session_context() as session:
            # TODO: store this information somewhere
            max_rank: int = session.query(func.max(Belt.rank)).scalar()  # type: ignore
            belt = Belt(
                name=request.args['name'],
                rank=max_rank + 1,
            )
            session.add(belt)
            session.commit()
            return {
                'belt': belt.json(),
            }


def create_app() -> Flask:
    app = Flask(__name__)
    app.register_blueprint(api_blueprint, url_prefix='/api')
    return app
