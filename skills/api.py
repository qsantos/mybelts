from typing import Any

from flask import Blueprint, Flask
from flask_restplus import Api, Resource  # type: ignore
from jsonschema import FormatChecker

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


def create_app() -> Flask:
    app = Flask(__name__)
    app.register_blueprint(api_blueprint, url_prefix='/api')
    return app
