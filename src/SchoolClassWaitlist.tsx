import React from 'react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';

import {
    Belt,
    SchoolClass,
    SkillDomain,
    Student,
    WaitlistEntry,
    WaitlistMapping,
} from './api';
import { joinArray } from './lib';
import BeltIcon from './BeltIcon';
import SchoolClassWaitlistConvertButton from './SchoolClassWaitlistConvertButton';
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
    waitlist_mappings: WaitlistMapping[];
}

export default function SchoolClassWaitlist(props: Props): ReactElement | null {
    const { school_class, students, skill_domains, belts, waitlist_mappings } =
        props;

    const { t } = useTranslation();

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

    const waitlist_by_student_id = React.useMemo(
        () =>
            Object.fromEntries(
                waitlist_mappings.map((waitlist_mapping) => {
                    const { student_id: key, waitlist_entries: value } =
                        waitlist_mapping;
                    return [key, value];
                })
            ),
        [waitlist_mappings]
    );

    if (waitlist_mappings.length === 0) {
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
    ) as unknown as [number, WaitlistEntry[]][]; // TypeScript thinks this is [stirng, WaitlistEntry[]][]

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
                    evaluation_count: waitlist_mappings.length,
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
            <SchoolClassWaitlistConvertButton
                belt_by_id={belt_by_id}
                skill_domain_by_id={skill_domain_by_id}
                student_by_id={student_by_id}
                sorted_waitlists={sorted_waitlists}
            />{' '}
            <SchoolClassExamsPDFButton
                school_class={school_class}
                setErrorMessage={setErrorMessage}
            />
        </Alert>
    );
}
