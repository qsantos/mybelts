from typing import Any, NoReturn, Set

from flask import Blueprint, Flask, request
from flask_restplus import fields  # type: ignore
from flask_restplus import Api, Resource
from flask_restplus import abort as flask_restplus_abort
from jsonschema import FormatChecker
from sqlalchemy import and_
from sqlalchemy.sql.expression import func

from skills.schema import (
    Belt, BeltAttempt, ClassLevel, SchoolClass, Student, session_context,
)


def abort(code: int, message: str) -> NoReturn:  # type: ignore
    flask_restplus_abort(code, message)


api_blueprint = Blueprint('api', __name__)
api = Api(
    api_blueprint,
    title='Skills API',
    format_checker=FormatChecker(),
    base_url='/api',
)

class_level_ns = api.namespace('Class Levels', path='/')
school_class_ns = api.namespace('School Classes', path='/')
students_ns = api.namespace('Students', path='/')
belts_ns = api.namespace('Belts', path='/')


@class_level_ns.route('/class-levels')
class ClassLevelsResource(Resource):
    def get(self) -> Any:
        with session_context() as session:
            return {
                'class_levels': [
                    class_level.json()
                    for class_level in session.query(ClassLevel).all()
                ],
            }

    post_model = api.model('ClassLevelsPost', {
        'prefix': fields.String(example='4e', required=True),
    })

    @api.expect(post_model, validate=True)
    def post(self) -> Any:
        with session_context() as session:
            class_level = ClassLevel(prefix=request.json['prefix'])
            session.add(class_level)
            session.commit()
            return {
                'class_level': class_level.json(),
            }


@class_level_ns.route('/class-levels/<int:class_level_id>/')
class ClassLevelClassesResource(Resource):
    def get(self, class_level_id: int) -> Any:
        with session_context() as session:
            class_level = session.query(ClassLevel).get(class_level_id)
            if class_level is None:
                abort(404, f'Class level {class_level_id} not found')
            return {
                'class_level': class_level.json(),
            }


@class_level_ns.route('/class-levels/<int:class_level_id>/school_classes')
class ClassLevelSchoolClassesResource(Resource):
    def get(self, class_level_id: int) -> Any:
        with session_context() as session:
            class_level = session.query(ClassLevel).get(class_level_id)
            if class_level is None:
                abort(404, f'Class level {class_level_id} not found')
            return {
                'class_level': class_level.json(),
                'school_classes': [
                    school_class.json()
                    for school_class in class_level.school_classes
                ],
            }

    post_model = api.model('ClassLevelSchoolClassesPost', {
        'suffix': fields.String(example='D', required=True),
    })

    @api.expect(post_model, validate=True)
    def post(self, class_level_id: int) -> Any:
        with session_context() as session:
            class_level = session.query(ClassLevel).get(class_level_id)
            if class_level is None:
                abort(404, f'Class level {class_level_id} not found')
            school_class = SchoolClass(
                class_level=class_level,
                suffix=request.json['suffix'],
            )
            session.add(school_class)
            session.commit()
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
            }


@school_class_ns.route('/school-classes/<int:school_class_id>/')
class SchoolClassResource(Resource):
    def get(self, school_class_id: int) -> Any:
        with session_context() as session:
            school_class = session.query(SchoolClass).get(school_class_id)
            if school_class is None:
                abort(404, f'School class {school_class_id} not found')
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
            }


@school_class_ns.route('/school-classes/<int:school_class_id>/students')
class SchoolClassStudentsResource(Resource):
    def get(self, school_class_id: int) -> Any:
        with session_context() as session:
            school_class = session.query(SchoolClass).get(school_class_id)
            if school_class is None:
                abort(404, f'School class {school_class_id} not found')
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'students': [
                    student.json()
                    for student in school_class.students
                ],
            }

    post_model = api.model('SchoolClassStudentsPost', {
        'name': fields.String(example='John Doe', required=True),
    })

    @api.expect(post_model, validate=True)
    def post(self, school_class_id: int) -> Any:
        with session_context() as session:
            school_class = session.query(SchoolClass).get(school_class_id)
            if school_class is None:
                abort(404, f'School class {school_class_id} not found')
            class_level = school_class.class_level
            student = Student(
                school_class=school_class,
                name=request.json['name'],
            )
            session.add(student)
            session.commit()
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'student': student.json(),
            }


@students_ns.route('/students/<int:student_id>/')
class StudentResource(Resource):
    def get(self, student_id: int) -> Any:
        with session_context() as session:
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            school_class = student.school_class
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'student': student.json(),
            }


@students_ns.route('/students/<int:student_id>/belt-attempts')
class StudentBeltAttemptsResource(Resource):
    def get(self, student_id: int) -> Any:
        with session_context() as session:
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            belts = []
            belt_ids: Set[int] = set()
            belt_attempts = []
            for belt_attempt in student.belt_attempts:
                belt_attempts.append(belt_attempt)
                if belt_attempt.belt_id not in belt_ids:
                    belt = belt_attempt.belt
                    belt_ids.add(belt.id)
                    belts.append(belt)
            return {
                'student': student.json(),
                'belts': [belt.json() for belt in belts],
                'belt_attempts': [belt_attempt.json() for belt_attempt in belt_attempts],
            }

    post_model = api.model('StudentBeltAttemptsPost', {
        'belt_id': fields.Integer(example=42, required=True),
        'success': fields.Boolean(example=True, required=True),
    })

    @api.expect(post_model, validate=True)
    def post(self, student_id: int) -> Any:
        with session_context() as session:
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            belt_id = request.json['belt_id']
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            belt_attempt = BeltAttempt(
                student_id=student_id,
                belt_id=belt_id,
                success=request.json['success'],
            )
            session.add(belt_attempt)
            session.commit()
            return {
                'student': student.json(),
                'belt': belt.json(),
                'belt_attempt': belt_attempt.json(),
            }


@belts_ns.route('/belts')
class BeltsResource(Resource):
    def get(self) -> Any:
        with session_context() as session:
            return {
                'belts': [
                    belt.json()
                    for belt in session.query(Belt)
                ],
            }

    post_model = api.model('BeltsPost', {
        'name': fields.String(example='White belt', required=True),
    })

    @api.expect(post_model, validate=True)
    def post(self) -> Any:
        with session_context() as session:
            # TODO: store this information somewhere
            max_rank: int = session.query(func.max(Belt.rank)).scalar()  # type: ignore
            belt = Belt(
                name=request.json['name'],
                rank=max_rank + 1,
            )
            session.add(belt)
            session.commit()
            return {
                'belt': belt.json(),
            }


@belts_ns.route('/belts/<int:belt_id>/')
class BeltResource(Resource):
    def get(self, belt_id: int) -> Any:
        with session_context() as session:
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')

            return {
                'belt': belt.json(),
            }

    put_model = api.model('BeltPut', {
        'name': fields.String(example='White belt', required=True),
    })

    @api.expect(put_model, validate=True)
    def put(self, belt_id: int) -> Any:
        with session_context() as session:
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')

            belt.name = request.json['name']
            session.commit()
            return {
                'belt': belt.json(),
            }


@belts_ns.route('/belts/<int:belt_id>/rank')
class BeltRankResource(Resource):
    patch_model = api.model('BeltRank', {
        'other_belt_id': fields.Integer(example=42, required=False),
        'go_up_n_ranks': fields.Integer(example=-2, required=False),
    })

    @api.expect(patch_model, validate=True)
    def patch(self, belt_id: int) -> Any:
        other_belt_id = request.json.get('other_belt_id')
        go_up_n_ranks = request.json.get('go_up_n_ranks')
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

            return {
                'belt': belt.json(),
            }


def create_app() -> Flask:
    app = Flask(__name__)
    app.config['ERROR_404_HELP'] = False
    app.register_blueprint(api_blueprint, url_prefix='/api')
    return app
