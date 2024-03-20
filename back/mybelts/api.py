from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from io import BytesIO
from tempfile import NamedTemporaryFile
from typing import TYPE_CHECKING, Any, NoReturn

import jwt
from flask import Blueprint, request, send_file, url_for
from flask_restx import Api, Resource, fields  # type: ignore
from flask_restx.apidoc import apidoc  # type: ignore
from flask_restx.reqparse import FileStorage  # type: ignore
from jsonschema import FormatChecker
from psycopg2.errors import UniqueViolation  # type: ignore
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql.expression import func

from mybelts.config import SECRET
from mybelts.exams2pdf import exams_to_print, print_exams_as_pdf
from mybelts.schema import (
    Belt,
    Class,
    Evaluation,
    Exam,
    Level,
    MissingI18nKey,
    SkillDomain,
    Student,
    User,
    WaitlistEntry,
    session_context,
)

# add typing to flask_restx.abort()
if TYPE_CHECKING:
    from sqlalchemy.orm import Session
    def abort(_code: int, _message: str) -> NoReturn:
        ...
else:
    from flask_restx import abort


# fix for location of SwaggerUI not at root
apidoc.static_url_path = '/api/swaggerui'


# fix for location of Swagger through reverse proxy
@property  # type: ignore
def specs_url(self: Api) -> str:
    return url_for(self.endpoint('specs'), _external=False)


Api.specs_url = specs_url
# end of fix

blueprint = Blueprint('api', __name__)
api = Api(
    blueprint,
    title='Skills API',
    format_checker=FormatChecker(),
    base_url='/api',
    authorizations={
        'apikey': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'The JWT preceded by "Bearer "',
        },
    },
    security='apikey',
)

users_ns = api.namespace('Users', path='/')
level_ns = api.namespace('Levels', path='/')
class_ns = api.namespace('Classes', path='/')
students_ns = api.namespace('Students', path='/')
skill_domains_ns = api.namespace('Skill Domains', path='/')
belts_ns = api.namespace('Belts', path='/')
evaluations_ns = api.namespace('Evaluations', path='/')
waitlist_ns = api.namespace('Waitlist', path='/')
exam_ns = api.namespace('Exams', path='/')


api_model_user = api.model('User', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'username': fields.String(example='tartempion', required=True),
    'is_admin': fields.Boolean(example=False, required=True),
    'last_login': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
})

api_model_level = api.model('Level', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'prefix': fields.String(example='4e', required=True),
})

api_model_class = api.model('Class', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'level_id': fields.Integer(example=42, required=True),
    'name': fields.String(example='D', required=True),
})

api_model_student = api.model('Student', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'user_id': fields.Integer(example=42, required=True),
    'username': fields.String(example='jdoe', required=True),
    'last_login': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'class_id': fields.Integer(example=42, required=True),
    'display_name': fields.String(example='John Doe', required=True),
    'rank': fields.Integer(example=7, required=True),
    'can_register_to_waitlist': fields.Boolean(example=False, required=True),
})

api_model_belt = api.model('Belt', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'rank': fields.Integer(example=5, required=True),
    'name': fields.String(example='White belt', required=True),
    'code': fields.String(example='1white', required=True),
    'color': fields.String(example='#012345', required=True),
})

api_model_skill_domain = api.model('SkillDomain', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'name': fields.String(example='Algebra', required=True),
    'code': fields.String(example='D1', required=True),
})

api_model_evaluation = api.model('Evaluation', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'student_id': fields.Integer(example=42, required=True),
    'skill_domain_id': fields.Integer(example=42, required=True),
    'belt_id': fields.Integer(example=42, required=True),
    'date': fields.Date(example='2021-11-13', required=True),
    'success': fields.Boolean(example=True, required=True),
})

api_model_waitlist_entry = api.model('WaitlistEntry', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'student_id': fields.Integer(example=42, required=True),
    'skill_domain_id': fields.Integer(example=42, required=True),
    'belt_id': fields.Integer(example=42, required=True),
    'last_printed': fields.DateTime(example='2021-11-13T12:34:56Z', required=False),
})

api_model_exam = api.model('Exam', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'level_id': fields.Integer(example=42, required=True),
    'skill_domain_id': fields.Integer(example=42, required=True),
    'belt_id': fields.Integer(example=42, required=True),
    'code': fields.String(example='B', required=True),
    'filename': fields.String(example='exam.pdf', required=True),
})

api_model_login_payload = api.model('LoginPayload', {
    'user_id': fields.Integer(example=42, required=True),
    'exp': fields.Float(example=1659261001.276245, required=True, help='Timestamp of the expiration'),
})

api_model_missing_i18n_key_event_count = api.model('MissingI18nKeyEventCount', {
    'total': fields.Integer(example=42, required=True),
    'unique': fields.Integer(example=42, required=True),
})

api_model_login_info = api.model('LoginInfo', {
    'payload': fields.Nested(api_model_login_payload, required=True),
    'token': fields.String(required=True),
    'user': fields.Nested(api_model_user, required=True),
    'student': fields.Nested(api_model_student, skip_none=True),
    'missing_i18n_key_events_since_last_login': fields.Nested(api_model_missing_i18n_key_event_count, skip_none=True),
})

api_model_missing_i18n_key_event = api.model('MissingI18nKeyEvent', {
    'language': fields.String(example='en', required=True),
    'namespace': fields.String(example='translation', required=True),
    'key': fields.String(example='main_title', required=True),
    'count': fields.Integer(example=42, required=True),
})

api_model_missing_i18n_key_event_list = api.model('MissingI18nKeyEventList', {
    'events': fields.List(fields.Nested(api_model_missing_i18n_key_event), required=True),
})

api_model_user_list = api.model('UserList', {
    'users': fields.List(fields.Nested(api_model_user), required=True),
})

api_model_user_one = api.model('UserOne', {
    'user': fields.Nested(api_model_user, required=True),
})

api_model_level_list = api.model('LevelList', {
    'levels': fields.List(fields.Nested(api_model_level), required=True),
})

api_model_level_one = api.model('LevelOne', {
    'level': fields.Nested(api_model_level, required=True),
})

api_model_class_list = api.model('ClassList', {
    'belts': fields.List(fields.Nested(api_model_belt), required=True),
    'skill_domains': fields.List(fields.Nested(api_model_skill_domain), required=True),
    'level': fields.Nested(api_model_level, required=True),
    'classes': fields.List(fields.Nested(api_model_class), required=True),
    'exams': fields.List(fields.Nested(api_model_exam), required=True),
})

api_model_class_one = api.model('ClassOne', {
    'level': fields.Nested(api_model_level, required=True),
    'class': fields.Nested(api_model_class, required=True),
})

api_model_student_list = api.model('StudentList', {
    'belts': fields.List(fields.Nested(api_model_belt), required=True),
    'skill_domains': fields.List(fields.Nested(api_model_skill_domain), required=True),
    'level': fields.Nested(api_model_level, required=True),
    'class': fields.Nested(api_model_class, required=True),
    'students': fields.List(fields.Nested(api_model_student), required=True),
    'student_belts': fields.List(fields.Nested(api.model('ClassStudentBeltsStudentBelts', {
        'student_id': fields.Integer(example=42, required=True),
        'belts': fields.List(fields.Nested(api.model('ClassStudentBeltsBelts', {
            'skill_domain_id': fields.Integer(example=42, required=True),
            'belt_id': fields.Integer(example=42, required=True),
        })), required=True),
    })), required=True),
})

api_model_student_list_bare = api.model('StudentListBare', {
    'students': fields.List(fields.Nested(api_model_student), required=True),
})

api_model_student_one = api.model('StudentOne', {
    'level': fields.Nested(api_model_level, required=True),
    'class': fields.Nested(api_model_class, required=True),
    'user': fields.Nested(api_model_user, required=True),
    'student': fields.Nested(api_model_student, required=True),
})

api_model_skill_domain_list = api.model('SkillDomainList', {
    'skill_domains': fields.List(fields.Nested(api_model_skill_domain), required=True),
})

api_model_skill_domain_one = api.model('SkillDomainOne', {
    'skill_domain': fields.Nested(api_model_skill_domain, required=True),
})

api_model_belt_list = api.model('BeltList', {
    'belts': fields.List(fields.Nested(api_model_belt), required=True),
})

api_model_belt_one = api.model('BeltOne', {
    'belt': fields.Nested(api_model_belt, required=True),
})

api_model_evaluation_list = api.model('EvaluationList', {
    'level': fields.Nested(api_model_level, required=True),
    'class': fields.Nested(api_model_class, required=True),
    'student': fields.Nested(api_model_student, required=True),
    'skill_domains': fields.List(fields.Nested(api_model_skill_domain), required=True),
    'belts': fields.List(fields.Nested(api_model_belt), required=True),
    'evaluations': fields.List(fields.Nested(api_model_evaluation), required=True),
})

api_model_evaluation_one = api.model('EvaluationOne', {
    'level': fields.Nested(api_model_level, required=True),
    'class': fields.Nested(api_model_class, required=True),
    'student': fields.Nested(api_model_student, required=True),
    'skill_domain': fields.Nested(api_model_skill_domain, required=True),
    'belt': fields.Nested(api_model_belt, required=True),
    'evaluation': fields.Nested(api_model_evaluation, required=True),
})

api_model_waitlist_entry_one = api.model('WaitlistEntryOne', {
    'waitlist_entry': fields.Nested(api_model_waitlist_entry, required=True),
})

api_model_waitlist_entry_list = api.model('WaitlistEntryList', {
    'waitlist_entries': fields.List(fields.Nested(api_model_waitlist_entry), required=True),
})

api_model_waitlist_mapping = api.model('WaitlistMapping', {
    'student_id': fields.Integer(example=42, required=True),
    'waitlist_entries': fields.List(fields.Nested(api_model_waitlist_entry), required=True),
})

api_model_waitlist_mapping_list = api.model('WaitlistMappingList', {
    'waitlist_mappings': fields.List(fields.Nested(api_model_waitlist_mapping), required=True),
})

api_model_exam_one = api.model('ExamOne', {
    'exam': fields.Nested(api_model_exam, required=True),
})


@api.route('/missing-i18n-key')
@api.doc(security=None)
class MissingI18nKeyResource(Resource):
    @api.marshal_with(api_model_missing_i18n_key_event_list)
    def get(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            group_by = (
                MissingI18nKey.language,
                MissingI18nKey.namespace,
                MissingI18nKey.key,
            )
            events = session.query(*group_by, func.count(MissingI18nKey.id)).group_by(*group_by).all()
            return {
                'events': [
                    {
                        'language': language,
                        'namespace': namespace,
                        'key': key,
                        'count': count,
                    }
                    for (language, namespace, key, count) in events
                ],
            }

    post_model = api.model('MissingI18nKeyPost', {
        'language': fields.String(example='en', required=True),
        'namespace': fields.String(example='translation', required=True),
        'key': fields.String(example='main_title', required=True),
    })

    @api.expect(post_model, validate=True)
    @api.response(204, 'Success')
    def post(self) -> Any:
        with session_context() as session:
            missing_i18n_key = MissingI18nKey(
                language=request.json['language'],
                namespace=request.json['namespace'],
                key=request.json['key'],
            )
            session.add(missing_i18n_key)
            session.commit()
            return None, 204


@api.route('/login')
@api.doc(security=None)
class LoginResource(Resource):
    post_model = api.model('LoginPost', {
        'username': fields.String(example='tartempion', required=True),
        'password': fields.String(example='correct horse battery staple', required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_login_info, skip_none=True)
    def post(self) -> Any:
        with session_context() as session:
            user = session.query(User).filter(User.username == request.json['username']).one_or_none()
            if user is None or user.password != request.json['password']:
                abort(401, 'Invalid credentials')
            last_login = user.last_login
            user.last_login = datetime.now(timezone.utc)
            missing_i18n_key_events_since_last_login = None
            if user.is_admin:
                events_since_last_login = session.query(MissingI18nKey)
                if last_login is not None:
                    events_since_last_login = events_since_last_login.filter(MissingI18nKey.created >= last_login)
                total = events_since_last_login.count()
                if total > 0:
                    missing_i18n_key_events_since_last_login = {
                        'total': total,
                        'unique': events_since_last_login.distinct(
                            MissingI18nKey.language,
                            MissingI18nKey.namespace,
                            MissingI18nKey.key,
                        ).count(),  # type: ignore
                    }
            session.commit()
            payload = {
                'user_id': user.id,
                'exp': (datetime.now(timezone.utc) + timedelta(hours=1)).timestamp(),
            }
            return {
                'payload': payload,
                'token': jwt.encode(payload, SECRET, algorithm='HS256'),
                'user': user.json(),
                'student': user.student.json() if user.student is not None else None,
                'missing_i18n_key_events_since_last_login': missing_i18n_key_events_since_last_login,
            }


def authenticate(session: Session) -> User:
    # fetch token
    authorization = request.headers.get('Authorization')
    if authorization is None:
        abort(401, 'Missing Authorization header')
    if not authorization.startswith('Bearer '):
        abort(401, 'Authorization header malformed')
    token = authorization[len('Bearer '):]
    # check token
    try:
        payload = jwt.decode(token, SECRET, algorithms=['HS256'], options={'require': ['exp', 'user_id']})
    except jwt.exceptions.DecodeError:
        abort(401, 'Token is malformed')
    except jwt.exceptions.MissingRequiredClaimError as e:
        abort(401, str(e))
    except jwt.exceptions.ExpiredSignatureError:
        abort(401, 'Token has expired')
    except jwt.exceptions.InvalidTokenError:
        abort(401, 'Token invalid')
    # fetch user
    user_id = payload.get('user_id')
    assert user_id is not None
    user = session.query(User).get(user_id)
    if user is None:
        abort(401, f'User {user_id} not found')
    return user


def need_admin(user: User) -> None:
    if not user.is_admin:
        abort(403, 'This action can only be performed by an administrator')


def authorize(user: User, authorized: bool) -> None:
    if not user.is_admin and not authorized:
        abort(403, 'This action can not be performed by this user')


@users_ns.route('/users')
class UsersResource(Resource):
    @api.marshal_with(api_model_user_list)
    def get(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            users = session.query(User).all()
            return {
                'users': [user.json() for user in users],
            }

    post_model = api.model('UsersPost', {
        'username': fields.String(example='tartempion', required=True),
        'password': fields.String(example='correct horse battery staple', required=True),
        'is_admin': fields.Boolean(example=False, required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_user_one)
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            user = User(
                username=request.json['username'],
                password=request.json['password'],
                is_admin=request.json['is_admin'],
            )
            session.add(user)
            try:
                session.commit()
            except IntegrityError as e:
                if isinstance(e.orig, UniqueViolation):
                    abort(409, f'User with username "{request.json["username"]}" already exists')
                else:
                    raise
            return {
                'user': user.json(),
            }


@users_ns.route('/users/<int:user_id>')
class UserResource(Resource):
    @api.marshal_with(api_model_user_one)
    def get(self, user_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            authorize(me, me.id == user_id)
            user = session.query(User).get(user_id)
            if user is None:
                abort(404, f'User {user_id} not found')
            return {
                'user': user.json(),
            }

    put_model = api.model('UserPut', {
        'username': fields.String(example='tartempion'),
        'password': fields.String(example='correct horse battery staple'),
        'is_admin': fields.Boolean(example=False),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_user_one)
    def put(self, user_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            user = session.query(User).get(user_id)
            if user is None:
                abort(404, f'User {user_id} not found')
            username = request.json.get('username')
            if username is not None:
                user.username = username
            password = request.json.get('password')
            if password is not None:
                user.password = password
            is_admin = request.json.get('is_admin')
            if is_admin is not None:
                user.is_admin = is_admin
            try:
                session.commit()
            except IntegrityError as e:
                if isinstance(e.orig, UniqueViolation):
                    abort(409, f'User with username "{username}" already exists')
                else:
                    raise
            return {
                'user': user.json(),
            }

    @api.response(204, 'Success')
    def delete(self, user_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            user = session.query(User).get(user_id)
            if user is None:
                abort(404, f'User {user_id} not found')
            session.query(User).filter(User.id == user_id).delete()
            session.commit()
            return None, 204


@level_ns.route('/levels')
class LevelsResource(Resource):
    @api.marshal_with(api_model_level_list)
    def get(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            return {
                'levels': [
                    level.json()
                    for level in session.query(Level).all()
                ],
            }

    post_model = api.model('LevelsPost', {
        'prefix': fields.String(example='4e', required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_level_one)
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            level = Level(prefix=request.json['prefix'])
            session.add(level)
            session.commit()
            return {
                'level': level.json(),
            }


@level_ns.route('/levels/<int:level_id>')
class LevelResource(Resource):
    @api.marshal_with(api_model_class_list)
    def get(self, level_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            level = session.query(Level).get(level_id)
            if level is None:
                abort(404, f'Level {level_id} not found')
            belts = session.query(Belt).all()
            skill_domains = session.query(SkillDomain).all()
            return {
                'belts': [belt.json() for belt in belts],
                'skill_domains': [skill_domain.json() for skill_domain in skill_domains],
                'level': level.json(),
                'classes': [
                    class_.json()
                    for class_ in level.classes
                ],
                'exams': [
                    exam.json()
                    for exam in level.exams
                ],
            }

    put_model = api.model('LevelPut', {
        'prefix': fields.String(example='4e'),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_level_one)
    def put(self, level_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            level = session.query(Level).get(level_id)
            if level is None:
                abort(404, f'Level {level_id} not found')
            prefix = request.json.get('prefix')
            if prefix is not None:
                level.prefix = prefix
            session.commit()
            return {
                'level': level.json(),
            }

    @api.response(204, 'Success')
    def delete(self, level_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            level = session.query(Level).get(level_id)
            if level is None:
                abort(404, f'Level {level_id} not found')
            session.query(Level).filter(Level.id == level.id).delete()
            session.commit()
            return None, 204


@level_ns.route('/levels/<int:level_id>/exams')
class LevelExamsResource(Resource):
    parser = api.parser()
    parser.add_argument('skill_domain_id', type=int, location='form', required=True)
    parser.add_argument('belt_id', type=int, location='form', required=True)
    parser.add_argument('code', type=str, location='form', required=True)
    parser.add_argument('filename', type=str, location='form', required=True)
    parser.add_argument('file', type=FileStorage, location='files', required=True)

    @api.marshal_with(api_model_exam_one)
    @api.expect(parser)
    def post(self, level_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            level = session.query(Level).get(level_id)
            if level is None:
                abort(404, f'Level {level_id} not found')

            try:
                belt_id = int(request.form['belt_id'])
            except (KeyError, ValueError):
                abort(400, 'Invalid belt id')
            try:
                skill_domain_id = int(request.form['skill_domain_id'])
            except (KeyError, ValueError):
                abort(400, 'Invalid skill domain id')
            try:
                file = request.files['file']
            except (KeyError, ValueError):
                abort(400, 'Invalid file')

            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain_id} not found')

            exam = Exam(
                level_id=level.id,
                belt_id=belt.id,
                skill_domain_id=skill_domain.id,
                code=request.form['code'],
                filename=request.form['filename'],
                file=file.read(),
            )
            session.add(exam)
            session.commit()
            return {
                'exam': exam.json(),
            }


@class_ns.route('/classes')
class ClassesResource(Resource):
    post_model = api.model('ClassesPost', {
        'level_id': fields.Integer(example=42, required=True),
        'name': fields.String(example='D', required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_class_one)
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            level_id = request.json['level_id']
            level = session.query(Level).get(level_id)
            if level is None:
                abort(404, f'Level {level_id} not found')
            class_ = Class(
                level=level,
                name=request.json['name'],
            )
            session.add(class_)
            session.commit()
            return {
                'level': level.json(),
                'class': class_.json(),
            }


@class_ns.route('/classes/<int:class_id>')
class ClassResource(Resource):
    @api.marshal_with(api_model_student_list)
    def get(self, class_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            authorize(me, me.student is not None and me.student.class_id == class_id)
            class_ = session.query(Class).get(class_id)
            if class_ is None:
                abort(404, f'Class {class_id} not found')
            level = class_.level

            evaluations = (
                session  # type: ignore
                .query(Evaluation)
                .filter(Evaluation.success)
                .outerjoin(Student)
                .filter(Student.class_id == class_id)
                .all()
            )

            belts = session.query(Belt).all()
            skill_domains = session.query(SkillDomain).all()
            students = class_.students

            # collect results
            belts_of_students: dict[int, list[dict[str, int]]] = {}
            for evaluation in evaluations:
                belts_of_students.setdefault(evaluation.student_id, []).append({
                    'skill_domain_id': evaluation.skill_domain_id,
                    'belt_id': evaluation.belt_id,
                })

            return {
                'belts': [belt.json() for belt in belts],
                'skill_domains': [skill_domain.json() for skill_domain in skill_domains],
                'students': [student.json() for student in students],
                'level': level.json(),
                'class': class_.json(),
                'student_belts': [
                    {
                        'student_id': student_id,
                        'belts': belts,
                    }
                    for student_id, belts in belts_of_students.items()
                ],
            }

    put_model = api.model('ClassPut', {
        'name': fields.String(example='4e'),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_class_one)
    def put(self, class_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            class_ = session.query(Class).get(class_id)
            if class_ is None:
                abort(404, f'Class {class_id} not found')
            name = request.json.get('name')
            if name is not None:
                class_.name = name
            session.commit()
            level = class_.level
            return {
                'level': level.json(),
                'class': class_.json(),
            }

    @api.response(204, 'Success')
    def delete(self, class_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            class_ = session.query(Class).get(class_id)
            if class_ is None:
                abort(404, f'Class {class_id} not found')
            session.query(Class).filter(Class.id == class_.id).delete()
            session.commit()
            return None, 204


@class_ns.route('/classes/<int:class_id>/waitlist')
class ClassWaitlistResource(Resource):
    @api.marshal_with(api_model_waitlist_mapping_list)
    def get(self, class_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            class_ = session.query(Class).get(class_id)
            if class_ is None:
                abort(404, f'Class {class_id} not found')

            waitlist_entries = (
                session  # type: ignore
                .query(WaitlistEntry)
                .outerjoin(Student)
                .filter(Student.class_id == class_id)
                .all()
            )

            # collect results
            waitlist_entries_of_students: dict[int, list[dict[str, int]]] = {}
            for waitlist_entry in waitlist_entries:
                waitlist_entries = waitlist_entries_of_students.setdefault(waitlist_entry.student_id, [])
                waitlist_entries.append(waitlist_entry.json())

            return {
                'waitlist_mappings': [
                    {
                        'student_id': student_id,
                        'waitlist_entries': waitlist_entries,
                    }
                    for student_id, waitlist_entries in waitlist_entries_of_students.items()
                ],
            }


@class_ns.route('/classes/<int:class_id>/exam-pdf')
class ClassExamPDFResource(Resource):
    post_model = api.model('ClassExamPdfPost', {
        'waitlist_entry_ids': fields.List(fields.Integer),
    })

    @api.expect(post_model, validate=True)
    @api.response(200, 'Success')
    def post(self, class_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            class_ = session.query(Class).get(class_id)
            if class_ is None:
                abort(404, f'Class {class_id} not found')

            level = class_.level
            full_class_name = level.prefix + class_.name

            waitlist_entry_ids = request.json['waitlist_entry_ids']
            exams_with_names, errors = exams_to_print(session, waitlist_entry_ids)
            if errors:
                abort(422, '\n'.join(errors))
            with NamedTemporaryFile(suffix='pdf') as tmpfile:
                print_exams_as_pdf(full_class_name, exams_with_names, tmpfile.name)
                return send_file(
                    BytesIO(tmpfile.read()),
                    as_attachment=True,
                    attachment_filename='exam.pdf',
                )


@students_ns.route('/students')
class StudentsResource(Resource):
    post_model = api.model('StudentsPost', {
        'class_id': fields.Integer(example=42, required=True),
        'username': fields.String(example='tartempion', required=True),
        'password': fields.String(example='correct horse battery staple', required=True),
        'display_name': fields.String(example='John Doe', required=True),
        'can_register_to_waitlist': fields.Boolean(example=False, required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_student_one)
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            class_id = request.json['class_id']
            class_ = session.query(Class).get(class_id)
            if class_ is None:
                abort(404, f'Class {class_id} not found')
            level = class_.level
            user = User(
                username=request.json['username'],
                password=request.json['password'],
            )
            student = Student(
                class_id=class_id,
                user=user,
                display_name=request.json['display_name'],
                can_register_to_waitlist=request.json['can_register_to_waitlist'],
            )
            session.add(student)
            try:
                session.commit()
            except IntegrityError as e:
                if isinstance(e.orig, UniqueViolation):
                    abort(409, f'User with username "{request.json["username"]}" already exists')
                else:
                    raise
            return {
                'level': level.json(),
                'class': class_.json(),
                'user': user.json(),
                'student': student.json(),
            }

    put_model_students = api.model('StudentsPutStudents', {
        'id': fields.Integer(example=42, required=True),
        'display_name': fields.String(example='John Doe'),
        'rank': fields.Integer(example=7),
        'can_register_to_waitlist': fields.Boolean(example=False),
    })
    put_model = api.model('StudentsPut', {
        'students': fields.List(fields.Nested(put_model_students, required=True)),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_student_list_bare)
    def put(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            students_json = request.json['students']
            session.bulk_update_mappings(Student, students_json)  # type: ignore
            students = session.query(Student).filter(
                Student.id.in_(student_json['id'] for student_json in students_json),
            ).all()
            session.commit()
            return {
                'students': [
                    student.json()
                    for student in students
                ],
            }


@students_ns.route('/students/<int:student_id>')
class StudentResource(Resource):
    @api.marshal_with(api_model_evaluation_list)
    def get(self, student_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            authorize(me, me.student is not None and me.student.id == student_id)
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')

            belts = session.query(Belt).all()
            skill_domains = session.query(SkillDomain).all()
            evaluations = session.query(Evaluation).filter(Evaluation.student_id == student.id).all()
            class_ = student.class_
            level = class_.level
            return {
                'level': level.json(),
                'class': class_.json(),
                'student': student.json(),
                'belts': [belt.json() for belt in belts],
                'skill_domains': [skill_domain.json() for skill_domain in skill_domains],
                'evaluations': [evaluation.json() for evaluation in evaluations],
            }

    put_model = api.model('StudentPut', {
        'display_name': fields.String(example='John Doe'),
        'username': fields.String(example='tartempion'),
        'password': fields.String(example='correct horse battery staple'),
        'rank': fields.Integer(example=7),
        'can_register_to_waitlist': fields.Boolean(example=False),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_student_one)
    def put(self, student_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            user = student.user
            display_name = request.json.get('display_name')
            if display_name is not None:
                student.display_name = display_name
            can_register_to_waitlist = request.json.get('can_register_to_waitlist')
            if can_register_to_waitlist is not None:
                student.can_register_to_waitlist = can_register_to_waitlist
            username = request.json.get('username')
            if username is not None:
                user.username = username
            password = request.json.get('password')
            if password:
                user.password = password
            rank = request.json.get('rank')
            if rank is not None:
                student.rank = rank
            session.commit()
            class_ = student.class_
            level = class_.level
            return {
                'level': level.json(),
                'class': class_.json(),
                'user': user.json(),
                'student': student.json(),
            }

    @api.response(204, 'Success')
    def delete(self, student_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            user_id = student.user_id
            session.query(Student).filter(Student.id == student.id).delete()
            session.query(User).filter(User.id == user_id).delete()
            session.commit()
            return None, 204


@students_ns.route('/students/<int:student_id>/waitlist')
class StudentWaitlistResource(Resource):
    @api.marshal_with(api_model_waitlist_entry_list)
    def get(self, student_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            authorize(me, me.student is not None and me.student.id == student_id)
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')

            waitlist_entries = session.query(WaitlistEntry).filter(WaitlistEntry.student_id == student_id).all()

            return {
                'waitlist_entries': [waitlist_entry.json() for waitlist_entry in waitlist_entries],
            }

    post_model = api.model('StudentWaitlistPost', {
        'belt_id': fields.Integer(example=42, required=True),
        'skill_domain_id': fields.Integer(example=42, required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_waitlist_entry_one)
    def post(self, student_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            authorize(
                me,
                (
                    me.student is not None and
                    me.student.id == student_id and
                    me.student.can_register_to_waitlist
                ),
            )
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            belt_id = request.json['belt_id']
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            skill_domain_id = request.json['skill_domain_id']
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain_id} not found')

            session.query(Evaluation).filter(Evaluation.success).subquery()

            achieved_belt = (
                session  # type: ignore
                .query(Belt)
                .outerjoin(Evaluation)
                .filter(Evaluation.student_id == student_id)
                .filter(Evaluation.skill_domain_id == skill_domain.id)
                .filter(Evaluation.success)
                .order_by(Belt.rank.desc())
                .limit(1)
                .one_or_none()
            )
            if achieved_belt:
                if belt.rank > achieved_belt.rank + 1:
                    abort(409, (
                        f'Registering for evaluation of {belt.name} (rank: {belt.rank}) '
                        f'in {skill_domain.name} but only reached '
                        f'{achieved_belt.name} (rank: {achieved_belt.rank}) so far'
                    ))
                if belt.rank < achieved_belt.rank + 1:
                    abort(409, (
                        f'Registering for evaluation of {belt.name} (rank: {belt.rank}) '
                        f'in {skill_domain.name} but already achieved '
                        f'{achieved_belt.name} (rank: {achieved_belt.rank})'
                    ))
            else:  # noqa: PLR5501
                if belt.rank > 1:
                    abort(409, (
                        f'Registering for evaluation of {belt.name} (rank: {belt.rank}) '
                        f'in {skill_domain.name} but no previous belt achieved yet'
                    ))

            waitlist_entry = WaitlistEntry(
                student_id=student_id,
                belt_id=belt_id,
                skill_domain_id=skill_domain_id,
            )
            session.add(waitlist_entry)
            try:
                session.commit()
            except IntegrityError as e:
                if isinstance(e.orig, UniqueViolation):
                    abort(409, (
                        f'Already existing waitlist entry for student {student_id}, '
                        f'belt {belt_id} and skill domain {skill_domain_id}'
                    ))
                else:
                    raise
            return {
                'waitlist_entry': waitlist_entry.json(),
            }


@skill_domains_ns.route('/skill-domains')
class SkillDomainsResource(Resource):
    @api.marshal_with(api_model_skill_domain_list)
    def get(self) -> Any:
        with session_context() as session:
            authenticate(session)
            skill_domains = session.query(SkillDomain).all()
            return {
                'skill_domains': [
                    skill_domain.json()
                    for skill_domain in skill_domains
                ],
            }

    post_model = api.model('SkillDomainsPost', {
        'name': fields.String(example='Algebra', required=True),
        'code': fields.String(example='D1', required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_skill_domain_one)
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            skill_domain = SkillDomain(
                name=request.json['name'],
                code=request.json['code'],
            )
            session.add(skill_domain)
            session.commit()
            return {
                'skill_domain': skill_domain.json(),
            }


@skill_domains_ns.route('/skill-domains/<int:skill_domain_id>')
class SkillDomainResource(Resource):
    put_model = api.model('SkillDomainPut', {
        'name': fields.String(example='Algebra'),
        'code': fields.String(example='D1'),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_skill_domain_one)
    def put(self, skill_domain_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain} not found')
            name = request.json.get('name')
            if name is not None:
                skill_domain.name = name
            code = request.json.get('code')
            if code is not None:
                skill_domain.code = code
            session.commit()
            return {
                'skill_domain': skill_domain.json(),
            }

    @api.response(204, 'Success')
    def delete(self, skill_domain_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain_id} not found')
            session.query(SkillDomain).filter(SkillDomain.id == skill_domain.id).delete()
            session.commit()
            return None, 204


@belts_ns.route('/belts')
class BeltsResource(Resource):
    @api.marshal_with(api_model_belt_list)
    def get(self) -> Any:
        with session_context() as session:
            authenticate(session)
            return {
                'belts': [belt.json() for belt in session.query(Belt)],
            }

    post_model = api.model('BeltsPost', {
        'name': fields.String(example='White belt', required=True),
        'code': fields.String(example='1white', required=True),
        'color': fields.String(example='#012345', required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_belt_one)
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            # TODO: store this information somewhere
            max_rank: int = session.query(func.max(Belt.rank)).scalar()  # type: ignore
            # no belt in database
            if max_rank is None:
                max_rank = 0
            belt = Belt(
                name=request.json['name'],
                rank=max_rank + 1,
                code=request.json.get('code', ''),
                color=request.json.get('color', ''),
            )
            session.add(belt)
            session.commit()
            return {
                'belt': belt.json(),
            }


@belts_ns.route('/belts/<int:belt_id>')
class BeltResource(Resource):
    put_model = api.model('BeltPut', {
        'name': fields.String(example='White belt'),
        'code': fields.String(example='1white'),
        'color': fields.String(example='#012345'),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_belt_one)
    def put(self, belt_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            name = request.json.get('name')
            if name is not None:
                belt.name = name
            code = request.json.get('code')
            if code is not None:
                belt.code = code
            color = request.json.get('color')
            if color is not None:
                belt.color = color
            session.commit()
            return {
                'belt': belt.json(),
            }

    @api.response(204, 'Success')
    def delete(self, belt_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            (
                session
                .query(Belt)
                .filter(Belt.rank > belt.rank)
                .update({Belt.rank: Belt.rank - 1})
            )
            session.query(Belt).filter(Belt.id == belt.id).delete()
            session.commit()
            return None, 204


@belts_ns.route('/belts/<int:belt_id>/rank')
class BeltRankResource(Resource):
    patch_model = api.model('BeltRank', {
        'other_belt_id': fields.Integer(example=42, required=False),
        'increase_by': fields.Integer(example=-2, required=False),
    })

    @api.expect(patch_model, validate=True)
    @api.marshal_with(api_model_belt_one)
    def patch(self, belt_id: int) -> Any:
        other_belt_id = request.json.get('other_belt_id')
        increase_by = request.json.get('increase_by')
        if other_belt_id is None and increase_by is None:
            abort(400, 'Do provide one of other_belt_id, increase_by')
        if other_belt_id is not None and increase_by is not None:
            abort(400, 'Only provide one of other_belt_id, increase_by')

        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
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
                assert increase_by is not None
                rank = belt.rank + increase_by
                if increase_by < 0:
                    if rank < 1:
                        abort(400, f"Cannot decrease belt's rank {belt_id} by {-increase_by}")
                    (
                        session
                        .query(Belt)
                        .filter(and_(rank <= Belt.rank, Belt.rank < belt.rank))
                        .update({Belt.rank: Belt.rank + 1})
                    )
                    belt.rank = rank
                    session.commit()
                elif increase_by == 0:
                    pass
                else:
                    # TODO: store this information somewhere
                    max_rank: int = session.query(func.max(Belt.rank)).scalar()  # type: ignore
                    if rank > max_rank:
                        abort(400, f"Cannot increase belt'rank {belt_id} by {increase_by}")
                    (
                        session
                        .query(Belt)
                        .filter(and_(belt.rank < Belt.rank, Belt.rank <= rank))
                        .update({Belt.rank: Belt.rank - 1})
                    )
                    belt.rank = rank
                    session.commit()

            return {
                'belt': belt.json(),
            }


@evaluations_ns.route('/evaluations')
class EvaluationsResource(Resource):
    post_model = api.model('EvaluationsPost', {
        'student_id': fields.Integer(example=42, required=True),
        'belt_id': fields.Integer(example=42, required=True),
        'skill_domain_id': fields.Integer(example=42, required=True),
        'date': fields.Date(example='2021-11-13', required=True),
        'success': fields.Boolean(example=True, required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_evaluation_one)
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            student_id = request.json['student_id']
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            belt_id = request.json['belt_id']
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            skill_domain_id = request.json['skill_domain_id']
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain_id} not found')
            date_string = request.json['date']
            try:
                date_value = date.fromisoformat(date_string)
            except ValueError:
                abort(400, f'Invalid date {date_string}')
            evaluation = Evaluation(
                student_id=student_id,
                belt_id=belt_id,
                skill_domain_id=skill_domain_id,
                date=date_value,
                success=request.json['success'],
            )
            session.add(evaluation)
            session.commit()
            class_ = student.class_
            level = class_.level
            return {
                'level': level.json(),
                'class': class_.json(),
                'student': student.json(),
                'belt': belt.json(),
                'skill_domain': skill_domain.json(),
                'evaluation': evaluation.json(),
            }


@evaluations_ns.route('/evaluations/<int:evaluation_id>')
class EvaluationResource(Resource):
    put_model = api.model('EvaluationPut', {
        'student_id': fields.Integer(example=42),
        'belt_id': fields.Integer(example=42),
        'skill_domain_id': fields.Integer(example=42),
        'date': fields.Date(example='2021-11-13'),
        'success': fields.Boolean(example=True),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_evaluation_one)
    def put(self, evaluation_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            evaluation = session.query(Evaluation).get(evaluation_id)
            if evaluation is None:
                abort(404, f'Evaluation {evaluation_id} not found')
            student_id = request.json.get('student_id')
            if student_id is not None:
                student = session.query(Student).get(student_id)
                if student is None:
                    abort(404, f'Student {student_id} not found')
                evaluation.student_id = student.id
            else:
                student = evaluation.student
            belt_id = request.json.get('belt_id')
            if belt_id is not None:
                belt = session.query(Belt).get(belt_id)
                if belt is None:
                    abort(404, f'Belt {belt_id} not found')
                evaluation.belt_id = belt.id
            else:
                belt = evaluation.belt
            skill_domain_id = request.json.get('skill_domain_id')
            if skill_domain_id is not None:
                skill_domain = session.query(SkillDomain).get(skill_domain_id)
                if skill_domain is None:
                    abort(404, f'Skill domain {skill_domain_id} not found')
                evaluation.skill_domain_id = skill_domain.id
            else:
                skill_domain = evaluation.skill_domain
            date_string = request.json.get('date')
            if date_string is not None:
                try:
                    date_value = date.fromisoformat(date_string)
                except ValueError:
                    abort(400, f'Invalid date {date_string}')
                evaluation.date = date_value
            success = request.json.get('success')
            if success is not None:
                evaluation.success = success
            session.commit()
            class_ = student.class_
            level = class_.level
            return {
                'level': level.json(),
                'class': class_.json(),
                'student': student.json(),
                'skill_domain': skill_domain.json(),
                'belt': belt.json(),
                'evaluation': evaluation.json(),
            }

    @api.response(204, 'Success')
    def delete(self, evaluation_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            evaluation = session.query(Evaluation).get(evaluation_id)
            if evaluation is None:
                abort(404, f'Evaluation {evaluation_id} not found')
            session.query(Evaluation).filter(Evaluation.id == evaluation.id).delete()
            session.commit()
            return None, 204


@waitlist_ns.route('/waitlist/<int:waitlist_id>')
class WaitlistResource(Resource):
    @api.response(204, 'Success')
    def delete(self, waitlist_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            waitlist_entry = session.query(WaitlistEntry).get(waitlist_id)
            if waitlist_entry is None:
                abort(404, f'Waitlist entry {waitlist_id} not found')
            authorize(
                me,
                (
                    me.student is not None and
                    me.student.id == waitlist_entry.student_id and
                    me.student.can_register_to_waitlist
                ),
            )
            session.query(WaitlistEntry).filter(WaitlistEntry.id == waitlist_id).delete()
            session.commit()
            return None, 204


@waitlist_ns.route('/waitlist/convert')
class WaitlistConvertResource(Resource):
    post_model_evaluation = api.model('CompletedEvaluation', {
        'waitlist_entry_id': fields.Integer(example=42, required=True),
        'date': fields.Date(example='2021-11-13', required=True),
        'success': fields.Boolean(example=True, required=True),
    })
    post_model = api.model('CompletedEvaluationList', {
        'completed_evaluations': fields.List(fields.Nested(post_model_evaluation, required=True)),
    })

    @api.expect(post_model, validate=True)
    @api.response(204, 'Success')
    def post(self) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            completed_evaluations = request.json['completed_evaluations']
            for completed_evaluation in completed_evaluations:
                date_string = completed_evaluation['date']
                try:
                    date_value = date.fromisoformat(date_string)
                except ValueError:
                    abort(400, f'Invalid date {date_string}')
                waitlist_entry_id = completed_evaluation['waitlist_entry_id']
                waitlist_entry = session.query(WaitlistEntry).get(waitlist_entry_id)
                if waitlist_entry is None:
                    abort(404, f'Waitlist entry {waitlist_entry_id} not found')
                evaluation = Evaluation(
                    student_id=waitlist_entry.student_id,
                    belt_id=waitlist_entry.belt_id,
                    skill_domain_id=waitlist_entry.skill_domain_id,
                    date=date_value,
                    success=completed_evaluation['success'],
                )
                session.add(evaluation)
                session.delete(waitlist_entry)  # type: ignore
            session.commit()
            return None, 204


@exam_ns.route('/exams/<int:exam_id>')
class ExamsResource(Resource):
    @api.response(200, 'Success')
    def get(self, exam_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            exam = session.query(Exam).get(exam_id)
            if exam is None:
                abort(404, f'Exam {exam_id} not found')
            return send_file(
                BytesIO(exam.file),
                as_attachment=True,
                attachment_filename='exam.pdf',
            )

    put_model = api.model('ExamPut', {
        'code': fields.String(example='B'),
        'filename': fields.String(example='exam.pdf'),
        'belt_id': fields.Integer(example=42),
        'skill_domain_id': fields.Integer(example=42),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_exam_one)
    def put(self, exam_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            exam = session.query(Exam).get(exam_id)
            if exam is None:
                abort(404, f'Exam {exam_id} not found')

            code = request.json.get('code')
            if code is not None:
                exam.code = code

            filename = request.json.get('filename')
            if filename is not None:
                exam.filename = filename

            belt_id = request.json.get('belt_id')
            if belt_id is not None:
                belt = session.query(Belt).get(belt_id)
                if belt is None:
                    abort(404, f'Belt {belt_id} not found')
                exam.belt_id = belt_id

            skill_domain_id = request.json.get('skill_domain_id')
            if skill_domain_id is not None:
                skill_domain = session.query(SkillDomain).get(skill_domain_id)
                if skill_domain is None:
                    abort(404, f'Skill domain {skill_domain_id} not found')
                exam.skill_domain_id = skill_domain_id

            session.commit()
            return {
                'exam': exam.json(),
            }

    @api.response(204, 'Success')
    def delete(self, exam_id: int) -> Any:
        with session_context() as session:
            me = authenticate(session)
            need_admin(me)
            exam = session.query(Exam).get(exam_id)
            if exam is None:
                abort(404, f'Exam {exam_id} not found')
            session.delete(exam)  # type: ignore
            session.commit()
            return None, 204
