from typing import Any, NoReturn

from flask import Blueprint, Flask, request
from flask_restplus import reqparse  # type: ignore
from flask_restplus import Api, Resource
from flask_restplus import abort as flask_restplus_abort
from jsonschema import FormatChecker
from sqlalchemy import and_
from sqlalchemy.sql.expression import func

from skills.schema import Belt, session_context


def abort(code: int, message: str) -> NoReturn:  # type: ignore
    flask_restplus_abort(code, message)


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


@belts_ns.route('/belts/<int:belt_id>')
class BeltResource(Resource):
    def get(self, belt_id: int) -> Any:
        with session_context() as session:
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')

            return belt.json()

    argparser = reqparse.RequestParser()
    argparser.add_argument('name', location='args', required=True)

    @api.expect(argparser)
    def put(self, belt_id: int) -> Any:
        with session_context() as session:
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')

            belt.name = request.args['name']
            session.commit()
            return belt.json()


@belts_ns.route('/belts/<int:belt_id>/rank')
class BeltRankResource(Resource):
    argparser = reqparse.RequestParser()
    argparser.add_argument('other_belt_id', location='args', type=int, required=False)
    argparser.add_argument('go_up_n_ranks', location='args', type=int, required=False)

    @api.expect(argparser)
    def patch(self, belt_id: int) -> Any:
        args = BeltRankResource.argparser.parse_args()
        other_belt_id = args.get('other_belt_id')
        go_up_n_ranks = args.get('go_up_n_ranks')
        if other_belt_id is None and go_up_n_ranks is None:
            abort(400, 'Do provide one of other_belt_id, go_up_n_ranks')
        if other_belt_id is not None and go_up_n_ranks is not None:
            abort(400, 'Only provide one of other_belt_id, go_up_n_ranks')

        with session_context() as session:
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')

            if other_belt_id is not None:
                other_belt = session.query(Belt).get(other_belt_id)
                if other_belt is None:
                    abort(404, f'Belt {other_belt_id} not found')
                belt.exchange_ranks(other_belt)
                session.commit()
            else:
                assert go_up_n_ranks is not None
                new_rank = belt.rank + go_up_n_ranks
                if go_up_n_ranks < 0:
                    if new_rank < 1:
                        abort(400, f'Cannot move belt {belt_id} by {-go_up_n_ranks} ranks downwards')
                    (
                        session
                        .query(Belt)
                        .filter(and_(new_rank <= Belt.rank, Belt.rank < belt.rank))
                        .update({Belt.rank: Belt.rank + 1})
                    )
                    belt.rank = new_rank
                    session.commit()
                elif go_up_n_ranks == 0:
                    pass
                else:
                    # TODO: store this information somewhere
                    max_rank: int = session.query(func.max(Belt.rank)).scalar()  # type: ignore
                    if new_rank > max_rank:
                        abort(400, f'Cannot move belt {belt_id} by {go_up_n_ranks} ranks upwards')
                    (
                        session
                        .query(Belt)
                        .filter(and_(belt.rank < Belt.rank, Belt.rank <= new_rank))
                        .update({Belt.rank: Belt.rank - 1})
                    )
                    belt.rank = new_rank
                    session.commit()

            return belt.json()


def create_app() -> Flask:
    app = Flask(__name__)
    app.config['ERROR_404_HELP'] = False
    app.register_blueprint(api_blueprint, url_prefix='/api')
    return app
