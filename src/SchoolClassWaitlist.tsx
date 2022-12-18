import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import {
    Belt,
    SchoolClass,
    SkillDomain,
    Student,
    WaitlistEntry,
    WaitlistService,
} from './api';
import { joinArray } from './lib';
import BeltIcon from './BeltIcon';
import ModalButton from './ModalButton';
import SchoolClassExamsPDFButton from './SchoolClassExamsPDFButton';

interface StudentEntriesProps {
    student_waitlist_entries: WaitlistEntry[];
    belt_by_id: { [index: number]: Belt };
    skill_domain_by_id: { [index: number]: SkillDomain };
}

function StudentEntries_(props: StudentEntriesProps) {
    const { student_waitlist_entries, belt_by_id, skill_domain_by_id } = props;
    return (
        <>
            {joinArray(
                student_waitlist_entries.map(({ skill_domain_id, belt_id }) => {
                    const skill_domain = skill_domain_by_id[skill_domain_id];
                    if (skill_domain === undefined) {
                        console.error(
                            'skill domain ' + skill_domain_id + ' not found'
                        );
                        return null;
                    }
                    const belt = belt_by_id[belt_id];
                    if (belt === undefined) {
                        console.error('belt ' + belt_id + ' not found');
                        return null;
                    }
                    return (
                        <span key={skill_domain_id}>
                            {skill_domain.name}{' '}
                            <BeltIcon belt={belt} height={20} />
                        </span>
                    );
                }),
                ' / '
            )}
        </>
    );
}

const StudentEntries = React.memo(StudentEntries_);

interface StudentItemProps {
    student: Student;
    student_waitlist_entries: WaitlistEntry[];
    belt_by_id: { [index: number]: Belt };
    skill_domain_by_id: { [index: number]: SkillDomain };
}

function StudentItem_(props: StudentItemProps) {
    const {
        student,
        student_waitlist_entries,
        belt_by_id,
        skill_domain_by_id,
    } = props;

    return (
        <li key={student.id}>
            <div className="ms-2 me-auto">
                <strong>{student.display_name}:</strong>
                <StudentEntries
                    student_waitlist_entries={student_waitlist_entries}
                    belt_by_id={belt_by_id}
                    skill_domain_by_id={skill_domain_by_id}
                />
            </div>
        </li>
    );
}

const StudentItem = React.memo(StudentItem_);

interface Props {
    school_class: SchoolClass;
    students: Student[];
    skill_domains: SkillDomain[];
    belts: Belt[];
    waitlist_entries: WaitlistEntry[];
}

export default function SchoolClassWaitlist(props: Props): ReactElement | null {
    const { school_class, students, skill_domains, belts, waitlist_entries } =
        props;

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState('');

    const belt_by_id = React.useMemo(
        () => Object.fromEntries(belts.map((belt) => [belt.id, belt])),
        [belts]
    );
    const skill_domain_by_id = React.useMemo(
        () =>
            Object.fromEntries(
                skill_domains.map((skill_domain) => [
                    skill_domain.id,
                    skill_domain,
                ])
            ),
        [skill_domains]
    );
    const student_by_id = Object.fromEntries(
        students.map((student) => [student.id, student])
    );

    const waitlist_by_student_id = React.useMemo(() => {
        const ret: { [index: number]: WaitlistEntry[] } = {};
        waitlist_entries.forEach((waitlist_entry) => {
            const student_id = waitlist_entry.student_id;
            const student_waitlist = ret[student_id];
            if (student_waitlist === undefined) {
                ret[student_id] = [waitlist_entry];
            } else {
                student_waitlist.push(waitlist_entry);
            }
        });
        return ret;
    }, [waitlist_entries]);

    if (waitlist_entries.length === 0) {
        return null;
    }

    const sorted_waitlists = Object.entries(waitlist_by_student_id).sort(
        ([a_id], [b_id]) => {
            const a = student_by_id[a_id];
            const b = student_by_id[b_id];
            if (!a || !b) {
                return 0;
            }
            return a.rank - b.rank;
        }
    );

    return (
        <Alert>
            <Alert.Heading>
                <img
                    src="/evaluation.png"
                    height="30"
                    alt={t('waitlist.image.alt')}
                />{' '}
                {t('waitlist.title', {
                    student_count: sorted_waitlists.length,
                    evaluation_count: waitlist_entries.length,
                })}
            </Alert.Heading>
            {errorMessage && (
                <Alert variant="danger">
                    {t('error')}: {errorMessage}
                </Alert>
            )}
            <ul>
                {sorted_waitlists.map(
                    ([student_id, student_waitlist_entries]) => {
                        const student = student_by_id[student_id];
                        if (student === undefined) {
                            console.error(
                                'student ' + student_id + ' not found'
                            );
                            return null;
                        }
                        return (
                            <StudentItem
                                key={student_id}
                                student={student}
                                student_waitlist_entries={
                                    student_waitlist_entries
                                }
                                belt_by_id={belt_by_id}
                                skill_domain_by_id={skill_domain_by_id}
                            />
                        );
                    }
                )}
            </ul>
            <ModalButton
                size="lg"
                i18nPrefix="waitlist.convert"
                onSubmit={(form: EventTarget) => {
                    const typed_form = form as typeof form & {
                        waitlist_entry_id: HTMLInputElement[];
                        completed: HTMLInputElement[];
                        date: HTMLInputElement[];
                        success: HTMLInputElement[];
                    };
                    const completed_evaluations = [];
                    // the index 0 of these variable is a DUMMY ENTRY
                    for (
                        let i = 1;
                        i < typed_form.waitlist_entry_id.length;
                        i++
                    ) {
                        const waitlist_entry_id =
                            typed_form.waitlist_entry_id[i]?.value;
                        const completed = typed_form.completed[i]?.checked;
                        const date = typed_form.date[i]?.value;
                        const success = typed_form.success[i]?.checked;
                        if (
                            !waitlist_entry_id ||
                            !completed ||
                            !date ||
                            success === undefined
                        ) {
                            continue;
                        }
                        completed_evaluations.push({
                            waitlist_entry_id: parseInt(waitlist_entry_id),
                            date,
                            success,
                        });
                    }
                    return WaitlistService.postWaitlistConvertResource({
                        completed_evaluations,
                    });
                }}
                onResponse={() => navigate(0)}
            >
                <Form.Group>
                    <Form.Label>
                        {t('waitlist.convert.common_date.title')}
                    </Form.Label>
                    <Form.Control
                        type="date"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        onChange={(event) => {
                            const date = event.target.value;
                            const modalBody =
                                event.target?.parentNode?.parentNode;
                            modalBody
                                ?.querySelectorAll('#date')
                                ?.forEach(
                                    (input) =>
                                        ((input as HTMLInputElement).value =
                                            date)
                                );
                        }}
                    />
                    <Form.Text className="text-muted">
                        {t('waitlist.convert.common_date.help')}
                    </Form.Text>
                </Form.Group>
                {/* ensure the fields are always arrays, even with a single waitlist_entry *}
            {/* BEGIN DUMMY ENTRY  */}
                <input type="hidden" id="waitlist_entry_id" />
                <input type="hidden" id="completed" />
                <input type="hidden" id="date" />
                <input type="hidden" id="success" />
                {/* END DUMMY ENTRY */}
                <Table>
                    <thead>
                        <tr>
                            <th>{t('waitlist.convert.columns.student')}</th>
                            <th>
                                {t('waitlist.convert.columns.skill_domain')}
                            </th>
                            <th>{t('waitlist.convert.columns.belt')}</th>
                            <th>{t('waitlist.convert.columns.completed')}</th>
                            <th>{t('waitlist.convert.columns.date')}</th>
                            <th>{t('waitlist.convert.columns.success')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted_waitlists.map(
                            ([student_id, student_waitlist_entries]) => {
                                const student = student_by_id[student_id];
                                if (student === undefined) {
                                    console.error(
                                        'student ' + student_id + ' not found'
                                    );
                                    return null;
                                }
                                return student_waitlist_entries.map(
                                    (
                                        { id, skill_domain_id, belt_id },
                                        index
                                    ) => {
                                        const skill_domain =
                                            skill_domain_by_id[skill_domain_id];
                                        if (skill_domain === undefined) {
                                            console.error(
                                                'skill domain ' +
                                                    skill_domain_id +
                                                    ' not found'
                                            );
                                            return null;
                                        }
                                        const belt = belt_by_id[belt_id];
                                        if (belt === undefined) {
                                            console.error(
                                                'belt ' + belt_id + ' not found'
                                            );
                                            return null;
                                        }
                                        return (
                                            <tr
                                                key={[
                                                    student_id,
                                                    skill_domain_id,
                                                    belt_id,
                                                ].toString()}
                                            >
                                                {index === 0 && (
                                                    <th
                                                        rowSpan={
                                                            student_waitlist_entries.length
                                                        }
                                                    >
                                                        {student.display_name}
                                                    </th>
                                                )}
                                                <td>{skill_domain.name}</td>
                                                <td>
                                                    <BeltIcon
                                                        belt={belt}
                                                        height={20}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="hidden"
                                                        id="waitlist_entry_id"
                                                        value={id}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        id="completed"
                                                        className="big-checkbox"
                                                        defaultChecked
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="date"
                                                        id="date"
                                                        defaultValue={new Date()
                                                            .toISOString()
                                                            .slice(0, 10)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        id="success"
                                                        className="big-checkbox"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    }
                                );
                            }
                        )}
                    </tbody>
                </Table>
            </ModalButton>{' '}
            <SchoolClassExamsPDFButton
                school_class={school_class}
                setErrorMessage={setErrorMessage}
            />
        </Alert>
    );
}
