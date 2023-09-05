from functools import lru_cache
from itertools import zip_longest
from os import remove
from subprocess import PIPE, CalledProcessError, check_output, run
from tempfile import NamedTemporaryFile
from typing import TypedDict

from sqlalchemy.orm import scoped_session

from mybelts.schema import Evaluation, Exam, WaitlistEntry

stamp_template = """\
<?xml version="1.0" encoding="UTF-8"?>
<svg width="210mm" height="297mm" viewBox="0 0 210 297" font-size="6px" text-anchor="middle">
   <text x="93" y="13.3">{display_name}</text>
   <text x="188.7" y="13.3">{full_class_name}</text>
</svg>
"""


@lru_cache
def stamp_of_student(display_name: str, full_class_name: str) -> bytes:
    stamp_svg = stamp_template.format(display_name=display_name, full_class_name=full_class_name).encode()
    command = ['inkscape', '/dev/stdin', '--export-type=pdf', '--export-filename=-']
    res = run(command, input=stamp_svg, stdout=PIPE, stderr=PIPE)
    stamp_pdf = res.stdout
    if not stamp_pdf:
        print(res.stderr.decode())
        raise CalledProcessError(0, command)
    return stamp_pdf


class Entry(TypedDict):
    student_id: int
    skill_domain_id: int
    belt_id: int


def exams_to_print(
    session: scoped_session,
    school_class_id: int,
    waitlist_entry_ids: [int],
) -> tuple[list[tuple[Exam, str]], list[str]]:
    # TODO: use single SQL query
    exams_with_names = []
    errors = []
    for waitlist_entry_id in waitlist_entry_ids:
        waitlist_entry = (
            session
            .query(WaitlistEntry)
            .get(waitlist_entry_id)
        )
        student = waitlist_entry.student
        attempt_number = (
            session  # type: ignore
            .query(Evaluation)
            .filter(Evaluation.student_id == waitlist_entry.student_id)
            .filter(Evaluation.skill_domain_id == waitlist_entry.skill_domain_id)
            .filter(Evaluation.belt_id == waitlist_entry.belt_id)
            .count()
        )
        exams = (
            session
            .query(Exam)
            # TODO: filter by class level id
            .filter(Exam.skill_domain_id == waitlist_entry.skill_domain_id)
            .filter(Exam.belt_id == waitlist_entry.belt_id)
            .order_by(Exam.code)
            .all()
        )
        if not exams:
            errors.append((
                f'No exam for skill_domain {waitlist_entry.skill_domain_id} '
                f'and belt {waitlist_entry.belt_id}'
            ))
            continue
        exam = exams[attempt_number % len(exams)]
        exams_with_names.append((exam, student.display_name))
    return exams_with_names, errors


def print_exams_as_pdf(full_class_name: str, exams_with_names: list[tuple[Exam, str]], path: str) -> None:

    # put first half on the left, second half on the right
    # e.g. 0, 5, 1, 6, 2, 7, 3, 8, 4, 9
    # pdfjam will then group them by two
    # e.g. 05 16 27 38 49
    # they will then be stacked and the stack cut in two
    # e.g. 05    0   5
    #      16    1   6
    #      27 →  2 & 7
    #      38    3   8
    #      49    4   9
    # the half-stacks can just be stacked again to get the original order
    h = (len(exams_with_names) + 1) // 2
    exams_with_names = [
        element
        for pair in zip_longest(exams_with_names[:h], exams_with_names[h:])
        for element in pair
        if element is not None
    ]

    try:
        # prepare all the exams and name-stamps
        exam_files = []
        stamp_files = []
        for exam, display_name in exams_with_names:
            stamp = stamp_of_student(display_name, full_class_name)
            stamp_file = NamedTemporaryFile(suffix='.pdf', delete=False)
            stamp_files.append(stamp_file.name)
            stamp_file.write(stamp)

            exam_file = NamedTemporaryFile(suffix='.pdf', delete=False)
            exam_files.append(exam_file.name)
            exam_file.write(exam.file)

        with (
            NamedTemporaryFile(suffix='.pdf') as all_stamps,
            NamedTemporaryFile(suffix='.pdf') as all_exams,
            NamedTemporaryFile(suffix='.pdf') as stamped_exams,
        ):
            # concatenate all the name-stamps
            check_output(['pdftk', *stamp_files, 'cat', 'output', all_stamps.name])

            # concatenate all the exams
            check_output(['pdftk', *exam_files, 'cat', 'output', all_exams.name])

            # stamp everything
            check_output(['pdftk', all_exams.name, 'multistamp', all_stamps.name, 'output', stamped_exams.name])

            # group two pages by sheet
            check_output(['pdfjam', '--quiet', stamped_exams.name, '--nup', '2x1', '--landscape', '--outfile', path])
    finally:
        for file in stamp_files + exam_files:
            remove(file)
