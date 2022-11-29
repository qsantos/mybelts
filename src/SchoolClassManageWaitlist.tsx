import React from 'react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { ColumnDef } from '@tanstack/react-table';

import {
    Belt,
    ClassLevel,
    SchoolClass,
    SchoolClassStudentBeltsStudentBelts,
    SkillDomain,
    Student,
    WaitlistEntry,
    WaitlistEntryList,
} from './api';
import SortTable from './SortTable';
import SchoolClassManageWaitlistButton from './SchoolClassManageWaitlistButton';

interface Props {
    class_level: ClassLevel;
    school_class: SchoolClass;
    students: Student[];
    skill_domains: SkillDomain[];
    belts: Belt[];
    student_belts: SchoolClassStudentBeltsStudentBelts[];
    waitlistEntryList: WaitlistEntryList;
    setWaitlistEntryList: (
        func: (
            waitlistEntryList: WaitlistEntryList | null
        ) => WaitlistEntryList | null
    ) => void;
}

export default function SchoolClassManageWaitlist(props: Props): ReactElement {
    const {
        class_level,
        school_class,
        students,
        skill_domains,
        belts,
        student_belts,
        waitlistEntryList,
        setWaitlistEntryList,
    } = props;
    const { t } = useTranslation();

    const { waitlist_entries } = waitlistEntryList;

    const belt_by_id = Object.fromEntries(belts.map((belt) => [belt.id, belt]));
    const belt_by_rank = Object.fromEntries(
        belts.map((belt) => [belt.rank, belt])
    );
    const student_belts_by_student_id = Object.fromEntries(
        student_belts.map(({ student_id, belts: xbelts }) => [
            student_id,
            xbelts,
        ])
    );

    const waitlist_by_student_id: { [index: number]: WaitlistEntry[] } = {};
    waitlist_entries.forEach((waitlist_entry) => {
        const student_id = waitlist_entry.student_id;
        const student_waitlist = waitlist_by_student_id[student_id];
        if (student_waitlist === undefined) {
            waitlist_by_student_id[student_id] = [waitlist_entry];
        } else {
            student_waitlist.push(waitlist_entry);
        }
    });

    const waitlist_entry_by_domain_by_student: {
        [index: number]: {
            [index: number]: WaitlistEntry;
        };
    } = {};
    students.forEach((student) => {
        const student_waitlist = waitlist_by_student_id[student.id];
        let waitlist_by_domain = {};
        if (student_waitlist) {
            waitlist_by_domain = Object.fromEntries(
                student_waitlist.map((waitlist_entry) => [
                    waitlist_entry.skill_domain_id,
                    waitlist_entry,
                ])
            );
        }
        waitlist_entry_by_domain_by_student[student.id] = waitlist_by_domain;
    });

    const columns: ColumnDef<Student>[] = [
        {
            id: 'rank',
            header: t('waitlist.manage.columns.rank'),
            accessorKey: 'rank',
        },
        {
            id: 'display_name',
            accessorKey: 'display_name',
            header: t('waitlist.manage.columns.display_name'),
            cell: (info) => {
                const student = info.row.original;
                return student.display_name;
            },
        },
    ];

    const [errorMessage, setErrorMessage] = useState('');

    const sorted_skill_domains = skill_domains.sort((a, b) =>
        a.code.localeCompare(b.code)
    );
    sorted_skill_domains.forEach((skill_domain) =>
        columns.push({
            id: skill_domain.name,
            header: skill_domain.name,
            cell: (info) => {
                const student = info.row.original;
                const this_belts = student_belts_by_student_id[student.id];
                let belt_id = undefined;
                if (this_belts !== undefined) {
                    this_belts.forEach(
                        ({ belt_id: xbelt_id, skill_domain_id }) => {
                            if (skill_domain_id === skill_domain.id) {
                                belt_id = xbelt_id;
                            }
                        }
                    );
                }

                const belt = belt_id ? belt_by_id[belt_id] : undefined;
                const next_belt = belt
                    ? belt_by_rank[belt.rank + 1]
                    : belt_by_rank[1];
                if (!next_belt) {
                    return null;
                }
                const waitlist_entry_bydomain =
                    waitlist_entry_by_domain_by_student[student.id];
                const waitlist_entry =
                    waitlist_entry_bydomain?.[skill_domain.id];
                return (
                    <SchoolClassManageWaitlistButton
                        student={student}
                        belt={next_belt}
                        skill_domain={skill_domain}
                        waitlist_entry={waitlist_entry}
                        setErrorMessage={setErrorMessage}
                        onCreate={(new_waitlist_entry) => {
                            setWaitlistEntryList((lastWaitlistEntryList) => {
                                if (lastWaitlistEntryList === null) {
                                    return null;
                                }
                                const {
                                    waitlist_entries: last_waitlist_entries,
                                } = lastWaitlistEntryList;
                                const new_waitlist_entries = [
                                    ...last_waitlist_entries,
                                ];
                                new_waitlist_entries.push(new_waitlist_entry);
                                return {
                                    ...lastWaitlistEntryList,
                                    waitlist_entries: new_waitlist_entries,
                                };
                            });
                        }}
                        onDelete={() => {
                            setWaitlistEntryList((lastWaitlistEntryList) => {
                                if (lastWaitlistEntryList === null) {
                                    return null;
                                }
                                if (waitlist_entry === undefined) {
                                    return null;
                                }
                                const {
                                    waitlist_entries: last_waitlist_entries,
                                } = lastWaitlistEntryList;
                                const index = last_waitlist_entries.findIndex(
                                    (candidate) =>
                                        candidate.id === waitlist_entry.id
                                );
                                if (index === undefined) {
                                    return null;
                                }
                                const new_waitlist_entries = [
                                    ...last_waitlist_entries,
                                ];
                                new_waitlist_entries.splice(index, 1);
                                return {
                                    ...waitlistEntryList,
                                    waitlist_entries: new_waitlist_entries,
                                };
                            });
                        }}
                    />
                );
            },
        })
    );

    const sorting = [
        {
            id: 'rank',
            desc: false,
        },
        {
            id: 'display_name',
            desc: false,
        },
    ];

    // similar to ModalButton, except no form or cancel/confirm buttons
    const i18nPrefix = 'waitlist.manage';
    const i18nArgs = { class_level, school_class };
    const [show, setShow] = useState(false);

    return (
        <>
            <OverlayTrigger
                overlay={
                    <Tooltip>
                        {t(i18nPrefix + '.button.tooltip', i18nArgs)}
                    </Tooltip>
                }
            >
                <Button onClick={() => setShow(true)}>
                    {t(i18nPrefix + '.button', i18nArgs)}
                </Button>
            </OverlayTrigger>
            <Modal
                size="xl"
                show={show}
                onHide={() => setShow(false)}
                scrollable
            >
                <Modal.Header>
                    <Modal.Title>
                        {t(i18nPrefix + '.title', i18nArgs)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {errorMessage && (
                        <Alert variant="danger">
                            {t('error')}: {errorMessage}
                        </Alert>
                    )}
                    <SortTable
                        data={students}
                        columns={columns}
                        initialSorting={sorting}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        {t(i18nPrefix + '.close', i18nArgs)}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
