import logging
from datetime import date
from time import sleep
from typing import Any, Dict, List, NoReturn, Set

from flask import Blueprint, Flask, request, url_for
from flask_restplus import fields  # type: ignore
from flask_restplus import Api, Resource
from flask_restplus import abort as flask_restplus_abort
from flask_restplus.apidoc import apidoc  # type: ignore
from jsonschema import FormatChecker
from sqlalchemy import and_
from sqlalchemy.sql.expression import func

from skills.schema import (
    Belt, BeltAttempt, ClassLevel, SchoolClass, SkillDomain, Student,
    session_context,
)


def abort(code: int, message: str) -> NoReturn:  # type: ignore
    flask_restplus_abort(code, message)


# fix for location of SwaggerUI not at root
apidoc.static_url_path = '/api/swaggerui'


# fix for location of Swagger through reverse proxy
@property  # type: ignore
def specs_url(self: Api) -> str:
    return url_for(self.endpoint('specs'), _external=False)


Api.specs_url = specs_url
# end of fix


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
skill_domains_ns = api.namespace('Skill Domains', path='/')
belts_ns = api.namespace('Belts', path='/')
belt_attempts_ns = api.namespace('Belt Attempts', path='/')


api_model_class_level = api.model('ClassLevel', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'prefix': fields.String(example='4e', required=True),
})

api_model_school_class = api.model('SchoolClass', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'class_level_id': fields.Integer(example=42, required=True),
    'suffix': fields.String(example='D', required=True),
})

api_model_student = api.model('Student', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'school_class_id': fields.Integer(example=42, required=True),
    'name': fields.String(example='John Doe', required=True),
})

api_model_belt = api.model('Belt', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'rank': fields.Integer(example=5, required=True),
    'name': fields.String(example='White belt', required=True),
    'color': fields.String(example='#012345', required=True),
})

api_model_skill_domain = api.model('SkillDomain', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'name': fields.String(example='Algebra', required=True),
})

api_model_belt_attempt = api.model('BeltAttempt', {
    'id': fields.Integer(example=42, required=True),
    'created': fields.DateTime(example='2021-11-13T12:34:56Z', required=True),
    'student_id': fields.Integer(example=42, required=True),
    'skill_domain_id': fields.Integer(example=42, required=True),
    'belt_id': fields.Integer(example=42, required=True),
    'date': fields.Date(example='2021-11-13', required=True),
    'success': fields.Boolean(example=True, required=True),
})

api_model_class_level_list = api.model('ClassLevelList', {
    'class_levels': fields.List(fields.Nested(api_model_class_level), required=True),
})

api_model_class_level_one = api.model('ClassLevelOne', {
    'class_level': fields.Nested(api_model_class_level, required=True),
})

api_model_school_class_list = api.model('SchoolClassList', {
    'class_level': fields.Nested(api_model_class_level, required=True),
    'school_classes': fields.List(fields.Nested(api_model_school_class), required=True),
})

api_model_school_class_one = api.model('SchoolClassOne', {
    'class_level': fields.Nested(api_model_class_level, required=True),
    'school_class': fields.Nested(api_model_school_class, required=True),
})

api_model_student_list = api.model('StudentList', {
    'class_level': fields.Nested(api_model_class_level, required=True),
    'school_class': fields.Nested(api_model_school_class, required=True),
    'students': fields.List(fields.Nested(api_model_student), required=True),
})

api_model_student_one = api.model('StudentOne', {
    'class_level': fields.Nested(api_model_class_level, required=True),
    'school_class': fields.Nested(api_model_school_class, required=True),
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

api_model_belt_attempt_list = api.model('BeltAttemptList', {
    'class_level': fields.Nested(api_model_class_level, required=True),
    'school_class': fields.Nested(api_model_school_class, required=True),
    'student': fields.Nested(api_model_student, required=True),
    'skill_domains': fields.List(fields.Nested(api_model_skill_domain), required=True),
    'belts': fields.List(fields.Nested(api_model_belt), required=True),
    'belt_attempts': fields.List(fields.Nested(api_model_belt_attempt), required=True),
})

api_model_belt_attempt_one = api.model('BeltAttemptOne', {
    'class_level': fields.Nested(api_model_class_level, required=True),
    'school_class': fields.Nested(api_model_school_class, required=True),
    'student': fields.Nested(api_model_student, required=True),
    'skill_domain': fields.Nested(api_model_skill_domain, required=True),
    'belt': fields.Nested(api_model_belt, required=True),
    'belt_attempt': fields.Nested(api_model_belt_attempt, required=True),
})

api_model_school_class_student_belts = api.model('SchoolClassStudentBelts', {
    'class_level': fields.Nested(api_model_class_level, required=True),
    'school_class': fields.Nested(api_model_school_class, required=True),
    'skill_domains': fields.List(fields.Nested(api_model_skill_domain), required=True),
    'belts': fields.List(fields.Nested(api_model_belt), required=True),
    'student_belts': fields.List(fields.Nested(api.model('SchoolClassStudentBeltsStudentBelts', {
        'student': fields.Nested(api_model_student, required=True),
        'belts': fields.List(fields.Nested(api.model('SchoolClassStudentBeltsBelts', {
            'skill_domain_id': fields.Integer(example=42, required=True),
            'belt_id': fields.Integer(example=42, required=True),
        })), required=True),
    })), required=True),
})


@class_level_ns.route('/class-levels')
class ClassLevelsResource(Resource):
    @api.marshal_with(api_model_class_level_list)
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
    @api.marshal_with(api_model_class_level_one)
    def post(self) -> Any:
        with session_context() as session:
            class_level = ClassLevel(prefix=request.json['prefix'])
            session.add(class_level)
            session.commit()
            return {
                'class_level': class_level.json(),
            }


@class_level_ns.route('/class-levels/<int:class_level_id>')
class ClassLevelResource(Resource):
    @api.marshal_with(api_model_class_level_one)
    def get(self, class_level_id: int) -> Any:
        with session_context() as session:
            class_level = session.query(ClassLevel).get(class_level_id)
            if class_level is None:
                abort(404, f'Class level {class_level_id} not found')
            return {
                'class_level': class_level.json(),
            }

    put_model = api.model('ClassLevelPut', {
        'prefix': fields.String(example='4e', required=True),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_class_level_one)
    def put(self, class_level_id: int) -> Any:
        with session_context() as session:
            class_level = session.query(ClassLevel).get(class_level_id)
            if class_level is None:
                abort(404, f'Class level {class_level_id} not found')
            class_level.prefix = request.json['prefix']
            session.commit()
            return {
                'class_level': class_level.json(),
            }

    def delete(self, class_level_id: int) -> Any:
        with session_context() as session:
            class_level = session.query(ClassLevel).get(class_level_id)
            if class_level is None:
                abort(404, f'Class level {class_level_id} not found')
            session.query(ClassLevel).filter(ClassLevel.id == class_level.id).delete()
            session.commit()


@class_level_ns.route('/class-levels/<int:class_level_id>/school-classes')
class ClassLevelSchoolClassesResource(Resource):
    @api.marshal_with(api_model_school_class_list)
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
    @api.marshal_with(api_model_school_class_one)
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


@school_class_ns.route('/school-classes/<int:school_class_id>')
class SchoolClassResource(Resource):
    @api.marshal_with(api_model_student_list)
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

    put_model = api.model('SchoolClassPut', {
        'suffix': fields.String(example='4e', required=True),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_school_class_one)
    def put(self, school_class_id: int) -> Any:
        with session_context() as session:
            school_class = session.query(SchoolClass).get(school_class_id)
            if school_class is None:
                abort(404, f'School class {school_class_id} not found')
            school_class.suffix = request.json['suffix']
            session.commit()
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
            }

    def delete(self, school_class_id: int) -> Any:
        with session_context() as session:
            school_class = session.query(SchoolClass).get(school_class_id)
            if school_class is None:
                abort(404, f'School class {school_class_id} not found')
            session.query(SchoolClass).filter(SchoolClass.id == school_class.id).delete()
            session.commit()


@school_class_ns.route('/school-classes/<int:school_class_id>/students')
class SchoolClassStudentsResource(Resource):
    @api.marshal_with(api_model_student_list)
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
    @api.marshal_with(api_model_student_one)
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


@school_class_ns.route('/school-classes/<int:school_class_id>/student-belts')
class SchoolClassStudentBeltsResource(Resource):
    @api.marshal_with(api_model_school_class_student_belts)
    def get(self, school_class_id: int) -> Any:
        with session_context() as session:
            school_class = session.query(SchoolClass).get(school_class_id)
            if school_class is None:
                abort(404, f'School class {school_class_id} not found')
            class_level = school_class.class_level

            success_belt_attempts = session.query(BeltAttempt).filter(BeltAttempt.success).subquery()
            students_belts_skill_domains = (
                session  # type: ignore
                .query(Student, Belt, SkillDomain)
                .select_from(Student)
                .outerjoin(success_belt_attempts)
                .outerjoin(Belt)
                .outerjoin(SkillDomain)
                .filter(Student.school_class_id == school_class_id)
                .all()
            )

            # collect results
            belts = {}
            skill_domains = {}
            belts_of_students: Dict[int, List[Dict[str, int]]] = {}
            students = {}
            for student, belt, skill_domain in students_belts_skill_domains:
                students[student.id] = student
                belts_of_student = belts_of_students.setdefault(student.id, [])
                if belt is not None and skill_domain is not None:
                    belts[belt.id] = belt
                    skill_domains[skill_domain.id] = skill_domain
                    belts_of_student.append({
                        'skill_domain_id': skill_domain.id,
                        'belt_id': belt.id,
                    })

            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'belts': [
                    belt.json()
                    for belt in belts.values()
                ],
                'skill_domains': [
                    skill_domain.json()
                    for skill_domain in skill_domains.values()
                ],
                'student_belts': [
                    {
                        'student': student.json(),
                        'belts': belts_of_students[student.id],
                    }
                    for student in students.values()
                ],
            }


@students_ns.route('/students/<int:student_id>')
class StudentResource(Resource):
    @api.marshal_with(api_model_student_one)
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

    put_model = api.model('StudentPut', {
        'name': fields.String(example='John Doe', required=True),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_student_one)
    def put(self, student_id: int) -> Any:
        with session_context() as session:
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            student.name = request.json['name']
            session.commit()
            school_class = student.school_class
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'student': student.json(),
            }

    def delete(self, student_id: int) -> Any:
        with session_context() as session:
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')
            session.query(Student).filter(Student.id == student.id).delete()
            session.commit()


@students_ns.route('/students/<int:student_id>/belt-attempts')
class StudentBeltAttemptsResource(Resource):
    @api.marshal_with(api_model_belt_attempt_list)
    def get(self, student_id: int) -> Any:
        with session_context() as session:
            student = session.query(Student).get(student_id)
            if student is None:
                abort(404, f'Student {student_id} not found')

            things = (
                session  # type: ignore
                .query(BeltAttempt, SkillDomain, Belt)
                .select_from(BeltAttempt)
                .outerjoin(SkillDomain)
                .outerjoin(Belt)
                .filter(BeltAttempt.student_id == student.id)
                .all()
            )

            belts = []
            belt_ids: Set[int] = set()
            skill_domains = []
            skill_domain_ids: Set[int] = set()
            belt_attempts = []
            for belt_attempt, belt, skill_domain in things:
                belt_attempts.append(belt_attempt)
                if belt.id not in belt_ids:
                    belt_ids.add(belt.id)
                    belts.append(belt)
                if skill_domain.id not in skill_domain_ids:
                    skill_domain_ids.add(skill_domain.id)
                    skill_domains.append(skill_domain)
            school_class = student.school_class
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'student': student.json(),
                'belts': [belt.json() for belt in belts],
                'skill_domains': [skill_domain.json() for skill_domain in skill_domains],
                'belt_attempts': [belt_attempt.json() for belt_attempt in belt_attempts],
            }

    post_model = api.model('StudentBeltAttemptsPost', {
        'belt_id': fields.Integer(example=42, required=True),
        'skill_domain_id': fields.Integer(example=42, required=True),
        'date': fields.Date(example='2021-11-13', required=True),
        'success': fields.Boolean(example=True, required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_belt_attempt_one)
    def post(self, student_id: int) -> Any:
        with session_context() as session:
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
            belt_attempt = BeltAttempt(
                student_id=student_id,
                belt_id=belt_id,
                skill_domain_id=skill_domain_id,
                date=date_value,
                success=request.json['success'],
            )
            session.add(belt_attempt)
            session.commit()
            school_class = student.school_class
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'student': student.json(),
                'belt': belt.json(),
                'skill_domain': skill_domain.json(),
                'belt_attempt': belt_attempt.json(),
            }


@skill_domains_ns.route('/skill-domains')
class SkillDomainsResource(Resource):
    @api.marshal_with(api_model_skill_domain_list)
    def get(self) -> Any:
        with session_context() as session:
            skill_domains = session.query(SkillDomain).all()
            return {
                'skill_domains': [
                    skill_domain.json()
                    for skill_domain in skill_domains
                ],
            }

    post_model = api.model('SKillDomainsPost', {
        'name': fields.String(example='Algebra', required=True),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_skill_domain_one)
    def post(self) -> Any:
        with session_context() as session:
            skill_domain = SkillDomain(
                name=request.json['name'],
            )
            session.add(skill_domain)
            session.commit()
            return {
                'skill_domain': skill_domain.json(),
            }


@skill_domains_ns.route('/skill-domains/<int:skill_domain_id>')
class SkillDomainResource(Resource):
    @api.marshal_with(api_model_skill_domain_one)
    def get(self, skill_domain_id: int) -> Any:
        with session_context() as session:
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain_id} not found')
            return {
                'skill_domain': skill_domain.json(),
            }

    put_model = api.model('SkillDomainPut', {
        'name': fields.String(example='Algebra', required=True),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_skill_domain_one)
    def put(self, skill_domain_id: int) -> Any:
        with session_context() as session:
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain} not found')
            skill_domain.name = request.json['name']
            session.commit()
            return {
                'skill_domain': skill_domain.json(),
            }

    def delete(self, skill_domain_id: int) -> Any:
        with session_context() as session:
            skill_domain = session.query(SkillDomain).get(skill_domain_id)
            if skill_domain is None:
                abort(404, f'Skill domain {skill_domain_id} not found')
            session.query(SkillDomain).filter(SkillDomain.id == skill_domain.id).delete()
            session.commit()


@belts_ns.route('/belts')
class BeltsResource(Resource):
    @api.marshal_with(api_model_belt_list)
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
        'color': fields.String(example='#012345', required=False),
    })

    @api.expect(post_model, validate=True)
    @api.marshal_with(api_model_belt_one)
    def post(self) -> Any:
        with session_context() as session:
            # TODO: store this information somewhere
            max_rank: int = session.query(func.max(Belt.rank)).scalar()  # type: ignore
            # no belt in database
            if max_rank is None:
                max_rank = 0
            belt = Belt(
                name=request.json['name'],
                rank=max_rank + 1,
                color=request.json.get('color', ''),
            )
            session.add(belt)
            session.commit()
            return {
                'belt': belt.json(),
            }


@belts_ns.route('/belts/<int:belt_id>')
class BeltResource(Resource):
    @api.marshal_with(api_model_belt_one)
    def get(self, belt_id: int) -> Any:
        with session_context() as session:
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            return {
                'belt': belt.json(),
            }

    put_model = api.model('BeltPut', {
        'name': fields.String(example='White belt', required=False),
        'color': fields.String(example='#012345', required=False),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_belt_one)
    def put(self, belt_id: int) -> Any:
        with session_context() as session:
            belt = session.query(Belt).get(belt_id)
            if belt is None:
                abort(404, f'Belt {belt_id} not found')
            new_name = request.json.get('name')
            if new_name is not None:
                belt.name = new_name
            new_color = request.json.get('color')
            if new_color is not None:
                belt.color = new_color
            session.commit()
            return {
                'belt': belt.json(),
            }

    def delete(self, belt_id: int) -> Any:
        with session_context() as session:
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
                new_rank = belt.rank + increase_by
                if increase_by < 0:
                    if new_rank < 1:
                        abort(400, f"Cannot decrease belt's rank {belt_id} by {-increase_by}")
                    (
                        session
                        .query(Belt)
                        .filter(and_(new_rank <= Belt.rank, Belt.rank < belt.rank))
                        .update({Belt.rank: Belt.rank + 1})
                    )
                    belt.rank = new_rank
                    session.commit()
                elif increase_by == 0:
                    pass
                else:
                    # TODO: store this information somewhere
                    max_rank: int = session.query(func.max(Belt.rank)).scalar()  # type: ignore
                    if new_rank > max_rank:
                        abort(400, f"Cannot increase belt'rank {belt_id} by {increase_by}")
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


@belt_attempts_ns.route('/belt-attempts/<int:belt_attempt_id>')
class BeltAttemptsResource(Resource):
    @api.marshal_with(api_model_belt_attempt_one)
    def get(self, belt_attempt_id: int) -> Any:
        with session_context() as session:
            belt_attempt = session.query(BeltAttempt).get(belt_attempt_id)
            if belt_attempt is None:
                abort(404, f'Belt attempt {belt_attempt_id} not found')
            skill_domain = belt_attempt.skill_domain
            belt = belt_attempt.belt
            student = belt_attempt.student
            school_class = student.school_class
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'student': student.json(),
                'skill_domain': skill_domain.json(),
                'belt': belt.json(),
                'belt_attempt': belt_attempt.json(),
            }

    put_model = api.model('BeltAttemptPut', {
        'student_id': fields.Integer(example=42, required=False),
        'belt_id': fields.Integer(example=42, required=False),
        'skill_domain_id': fields.Integer(example=42, required=False),
        'date': fields.Date(example='2021-11-13', required=True),
        'success': fields.Boolean(example=True, required=False),
    })

    @api.expect(put_model, validate=True)
    @api.marshal_with(api_model_belt_attempt_one)
    def put(self, belt_attempt_id: int) -> Any:
        with session_context() as session:
            belt_attempt = session.query(BeltAttempt).get(belt_attempt_id)
            if belt_attempt is None:
                abort(404, f'Belt attempt {belt_attempt_id} not found')
            student_id = request.json.get('student_id')
            if student_id is not None:
                student = session.query(Student).get(student_id)
                if student is None:
                    abort(404, f'Student {student_id} not found')
                belt_attempt.student_id = student.id
            else:
                student = belt_attempt.student
            belt_id = request.json.get('belt_id')
            if belt_id is not None:
                belt = session.query(Belt).get(belt_id)
                if belt is None:
                    abort(404, f'Belt {belt_id} not found')
                belt_attempt.belt_id = belt.id
            else:
                belt = belt_attempt.belt
            skill_domain_id = request.json.get('skill_domain_id')
            if skill_domain_id is not None:
                skill_domain = session.query(SkillDomain).get(skill_domain_id)
                if skill_domain is None:
                    abort(404, f'Skill domain {skill_domain_id} not found')
                belt_attempt.skill_domain_id = skill_domain.id
            else:
                skill_domain = belt_attempt.skill_domain
            date_string = request.json.get('date')
            if date_string is not None:
                try:
                    date_value = date.fromisoformat(date_string)
                except ValueError:
                    abort(400, f'Invalid date {date_string}')
                belt_attempt.date = date_value
            success = request.json.get('success')
            if success is not None:
                belt_attempt.success = success
            session.commit()
            school_class = student.school_class
            class_level = school_class.class_level
            return {
                'class_level': class_level.json(),
                'school_class': school_class.json(),
                'student': student.json(),
                'skill_domain': skill_domain.json(),
                'belt': belt.json(),
                'belt_attempt': belt_attempt.json(),
            }

    def delete(self, belt_attempt_id: int) -> Any:
        with session_context() as session:
            belt_attempt = session.query(BeltAttempt).get(belt_attempt_id)
            if belt_attempt is None:
                abort(404, f'Belt attempt {belt_attempt_id} not found')
            session.query(BeltAttempt).filter(BeltAttempt.id == belt_attempt.id).delete()
            session.commit()


def create_app() -> Flask:
    app = Flask(__name__)
    app.config['ERROR_404_HELP'] = False
    app.config['SWAGGER_UI_DOC_EXPANSION'] = 'list'
    app.register_blueprint(api_blueprint, url_prefix='/api')

    if app.debug:
        logging.basicConfig()
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

        @app.before_request
        def wait() -> None:
            sleep(.3)

    return app
