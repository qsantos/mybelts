import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';
import { ColumnDef } from '@tanstack/react-table';

import {
    ClassLevel,
    SchoolClass, SchoolClassesService,
    Student, StudentsService,
    SkillDomain, Belt,
    WaitlistEntry, WaitlistEntryList, WaitlistService,
    SchoolClassStudentBeltsStudentBelts,
} from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import { BeltIcon } from './belt';
import { joinArray } from './lib';
import { ModalButton } from './modal-button';
import { SortTable } from './sort-table';

interface CreateSchoolClassButtonProps {
    class_level: ClassLevel;
    createdCallback?: (school_class: SchoolClass) => void;
}

export function CreateSchoolClassButton(props : CreateSchoolClassButtonProps): ReactElement {
    const { class_level, createdCallback } = props;
    const { t } = useTranslation();

    return <>
        <ModalButton
            i18nPrefix="school_class.add"
            i18nArgs={{ class_level }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    suffix: {value: string};
                };
                return SchoolClassesService.postSchoolClassesResource({
                    class_level_id: class_level.id,
                    suffix: typed_form.suffix.value,
                });
            }}
            onResponse={({ school_class }) => createdCallback?.(school_class)}
        >
            <Form.Group controlId="suffix">
                <Form.Label>{t('school_class.add_edit.suffix.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('school_class.add_edit.suffix.placeholder')}/>
                <Form.Text className="text-muted">
                    {t('school_class.add_edit.suffix.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    </>;
}

interface EditSchoolClassButtonProps {
    class_level: ClassLevel;
    school_class: SchoolClass;
    changedCallback?: (changed_school_class: SchoolClass) => void;
}

export function EditSchoolClassButton(props : EditSchoolClassButtonProps): ReactElement {
    const { class_level, school_class, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="school_class.edit"
            i18nArgs={{ class_level, school_class }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    suffix: {value: string};
                };
                return SchoolClassesService.putSchoolClassResource(school_class.id, {
                    suffix: typed_form.suffix.value,
                });
            }}
            onResponse={({ school_class: changed_school_class }) => changedCallback?.(changed_school_class)}
        >
            <Form.Group controlId="suffix">
                <Form.Label>{t('school_class.add_edit.suffix.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('school_class.add_edit.suffix.placeholder')} defaultValue={school_class.suffix} />
                <Form.Text className="text-muted">
                    {t('school_class.add_edit.suffix.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface DeleteSchoolClassButtonProps {
    class_level: ClassLevel;
    school_class: SchoolClass;
    deletedCallback?: () => void;
}

export function DeleteSchoolClassButton(props : DeleteSchoolClassButtonProps): ReactElement {
    const { class_level, school_class, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="school_class.delete"
            i18nArgs={{ class_level, school_class }}
            onSubmit={() => SchoolClassesService.deleteSchoolClassResource(school_class.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('school_class.delete.message', { class_level, school_class })}
        </ModalButton>
    );
}

interface SchoolClassListingProps {
    class_level: ClassLevel,
    school_classes: SchoolClass[];
    setSchoolClasses: (school_classes: SchoolClass[]) => void;
}

export function SchoolClassListing(props: SchoolClassListingProps): ReactElement {
    const { class_level, school_classes, setSchoolClasses } = props;
    const { t } = useTranslation();
    return <>
        <Table>
            <thead>
                <tr>
                    <th>{t('school_class.list.suffix.title')}</th>
                    <AdminOnly>
                        <th>{t('school_class.list.actions.title')}</th>
                    </AdminOnly>
                </tr>
            </thead>
            <tbody>
                {school_classes.map((school_class, index) =>
                    <tr key={school_class.id}>
                        <td>
                            <Nav.Link as={Link} to={'/school-classes/' + school_class.id}>
                                {school_class.suffix}
                            </Nav.Link>
                        </td>
                        <AdminOnly>
                            <td>
                                <EditSchoolClassButton
                                    class_level={class_level}
                                    school_class={school_class}
                                    changedCallback={new_school_class => {
                                        const new_school_classes = [...school_classes];
                                        new_school_classes[index] = new_school_class;
                                        setSchoolClasses(new_school_classes);
                                    }}
                                />
                                {' '}
                                <DeleteSchoolClassButton
                                    class_level={class_level}
                                    school_class={school_class}
                                    deletedCallback={() => {
                                        const new_school_classes = [...school_classes];
                                        new_school_classes.splice(index, 1);
                                        setSchoolClasses(new_school_classes);
                                    }}
                                />
                            </td>
                        </AdminOnly>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}

interface SchoolClassExamsPDFButtonProps {
    school_class: SchoolClass,
    setErrorMessage: (v: string) => void,
}

export function SchoolClassExamsPDFButton(props: SchoolClassExamsPDFButtonProps): ReactElement {
    const { school_class, setErrorMessage } = props;

    const { t } = useTranslation();
    const [in_process, setIn_process] = useState(false);

    function downloadExamsPDF() {
        setIn_process(true);
        return SchoolClassesService.getSchoolClassExamPdfResource(school_class.id)
            .then((blob: Blob) => {
                const url = URL.createObjectURL(blob);
                try {
                    const link = document.createElement('A') as HTMLAnchorElement;
                    link.href = url;
                    link.download = 'exam.pdf';
                    link.click();
                } finally {
                    URL.revokeObjectURL(url);
                }
                setIn_process(false);
            })
            .catch(error => {
                setIn_process(false);
                setErrorMessage(getAPIError(error));
            })
        ;
    }

    if (in_process) {
        return (
            <Button disabled>
                <Spinner animation="border" role="status" size="sm">
                    <span className="visually-hidden"></span>
                </Spinner>
            </Button>
        );
    } else {
        return (
            <Button onClick={downloadExamsPDF}>
                <img src="/pdf.svg" height="20" alt={t('waitlist.exam_pdf.image.alt')} />
            </Button>
        );
    }
}

interface SchoolClassWaitlistProps {
    school_class: SchoolClass,
    students: Student[],
    skill_domains: SkillDomain[],
    belts: Belt[],
    waitlist_entries: WaitlistEntry[],
}

export function SchoolClassWaitlist(props: SchoolClassWaitlistProps): (ReactElement | null) {
    const { school_class, students, skill_domains, belts, waitlist_entries } = props;

    if (waitlist_entries.length === 0) {
        return null;
    }

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState('');

    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));
    const skill_domain_by_id = Object.fromEntries(skill_domains.map(skill_domain => [skill_domain.id, skill_domain]));
    const student_by_id = Object.fromEntries(students.map(student => [student.id, student]));

    const waitlist_by_student_id: {[index: number]: WaitlistEntry[]} = {};
    waitlist_entries.forEach(waitlist_entry => {
        const student_id = waitlist_entry.student_id;
        const student_waitlist = waitlist_by_student_id[student_id];
        if (student_waitlist === undefined) {
            waitlist_by_student_id[student_id] = [waitlist_entry];
        } else {
            student_waitlist.push(waitlist_entry);
        }
    });

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
                <img src="/evaluation.png" height="30" alt={t('waitlist.image.alt')} />
                {' '}
                {t('waitlist.title', {
                    student_count: sorted_waitlists.length,
                    evaluation_count: waitlist_entries.length,
                })}
            </Alert.Heading>
            {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
            <ul>
                {sorted_waitlists.map(([student_id, student_waitlist_entries]) => {
                    const student = student_by_id[student_id];
                    if (student === undefined) {
                        console.error('student ' + student_id + ' not found');
                        return null;
                    }
                    return (
                        <li key={student_id}>
                            <div className="ms-2 me-auto">
                                <strong>{student.display_name}:</strong>
                                {' '}
                                {joinArray(student_waitlist_entries.map(({skill_domain_id, belt_id}) => {
                                    const skill_domain = skill_domain_by_id[skill_domain_id];
                                    if (skill_domain === undefined) {
                                        console.error('skill domain ' + skill_domain_id + ' not found');
                                        return null;
                                    }
                                    const belt = belt_by_id[belt_id];
                                    if (belt === undefined) {
                                        console.error('belt ' + belt_id + ' not found');
                                        return null;
                                    }
                                    return <span key={skill_domain_id}>
                                        {skill_domain.name} <BeltIcon belt={belt} height={20} />
                                    </span>;
                                }), ' / ')}
                            </div>
                        </li>
                    );
                })}
            </ul>
            <ModalButton
                size="lg"
                i18nPrefix="waitlist.convert"
                onSubmit={(form: EventTarget) => {
                    const typed_form = form as typeof form & {
                        waitlist_entry_id: HTMLInputElement[],
                        completed: HTMLInputElement[],
                        date: HTMLInputElement[],
                        success: HTMLInputElement[],
                    };
                    const completed_evaluations = [];
                    // the index 0 of these variable is a DUMMY ENTRY
                    for (let i = 1; i < typed_form.waitlist_entry_id.length; i++) {
                        const waitlist_entry_id = typed_form.waitlist_entry_id[i]?.value;
                        const completed = typed_form.completed[i]?.checked;
                        const date = typed_form.date[i]?.value;
                        const success = typed_form.success[i]?.checked;
                        if (!waitlist_entry_id || !completed || !date || success === undefined) {
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
                    <Form.Label>{t('waitlist.convert.common_date.title')}</Form.Label>
                    <Form.Control
                        type="date"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        onChange={event => {
                            const date = event.target.value;
                            const modalBody = event.target?.parentNode?.parentNode;
                            modalBody?.querySelectorAll('#date')?.forEach(input => (input as HTMLInputElement).value = date);
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
                            <th>{t('waitlist.convert.columns.skill_domain')}</th>
                            <th>{t('waitlist.convert.columns.belt')}</th>
                            <th>{t('waitlist.convert.columns.completed')}</th>
                            <th>{t('waitlist.convert.columns.date')}</th>
                            <th>{t('waitlist.convert.columns.success')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted_waitlists.map(([student_id, student_waitlist_entries]) => {
                            const student = student_by_id[student_id];
                            if (student === undefined) {
                                console.error('student ' + student_id + ' not found');
                                return null;
                            }
                            return student_waitlist_entries.map(({id, skill_domain_id, belt_id}, index) => {
                                const skill_domain = skill_domain_by_id[skill_domain_id];
                                if (skill_domain === undefined) {
                                    console.error('skill domain ' + skill_domain_id + ' not found');
                                    return null;
                                }
                                const belt = belt_by_id[belt_id];
                                if (belt === undefined) {
                                    console.error('belt ' + belt_id + ' not found');
                                    return null;
                                }
                                return <tr key={[student_id,skill_domain_id,belt_id].toString()}>
                                    {index === 0 &&
                                        <th rowSpan={student_waitlist_entries.length}>
                                            {student.display_name}
                                        </th>
                                    }
                                    <td>{skill_domain.name}</td>
                                    <td><BeltIcon belt={belt} height={20} /></td>
                                    <td>
                                        <input type="hidden" id="waitlist_entry_id" value={id} />
                                        <input type="checkbox" id="completed" defaultChecked />
                                    </td>
                                    <td>
                                        <input type="date" id="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                                    </td>
                                    <td>
                                        <input type="checkbox" id="success" />
                                    </td>
                                </tr>;
                            });
                        })}
                    </tbody>
                </Table>
            </ModalButton>
            {' '}
            <SchoolClassExamsPDFButton school_class={school_class} setErrorMessage={setErrorMessage} />
        </Alert>
    );
}

interface ManageClassWaitlistButtonProps {
    student: Student;
    skill_domain: SkillDomain;
    belt: Belt;
    waitlist_entry?: WaitlistEntry;
    setErrorMessage: (error: string) => void;
    onCreate?: (waitlistEntryList: WaitlistEntry) => void;
    onDelete?: () => void;
}

export function ManageClassWaitlistButton(props: ManageClassWaitlistButtonProps): ReactElement {
    const { student, skill_domain, belt, waitlist_entry, setErrorMessage, onCreate, onDelete } = props;
    const { t } = useTranslation();

    const className = waitlist_entry ? 'selected-waitlist' : 'unselected-waitlist';
    const [in_process, setIn_process] = useState(false);
    function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setIn_process(true);
        setErrorMessage('');
        event.preventDefault();
        if (waitlist_entry) {
            WaitlistService.deleteWaitlistResource(waitlist_entry.id)
                .then(() => {
                    setIn_process(false);
                    onDelete?.();
                })
                .catch(error => {
                    setIn_process(false);
                    setErrorMessage(getAPIError(error));
                });
        } else {
            StudentsService.postStudentWaitlistResource(student.id, {
                skill_domain_id: skill_domain.id,
                belt_id: belt.id,
            })
                .then(({waitlist_entry: new_waitlist_entry}) => {
                    setIn_process(false);
                    onCreate?.(new_waitlist_entry);
                })
                .catch(error => {
                    setIn_process(false);
                    setErrorMessage(getAPIError(error));
                });
        }
    }
    if (in_process) {
        return <Spinner animation="border" role="status" size="sm">
            <span className="visually-hidden">{t('waitlist.manage.in_process')}</span>
        </Spinner>;
    } else {
        return <div className={className} onClick={handleClick}>
            <BeltIcon belt={belt} />
        </div>;
    }
}

interface ManageClassWaitlistProps {
    class_level: ClassLevel;
    school_class: SchoolClass;
    students: Student[];
    skill_domains: SkillDomain[];
    belts: Belt[];
    student_belts: SchoolClassStudentBeltsStudentBelts[];
    waitlistEntryList: WaitlistEntryList;
    setWaitlistEntryList: (func: (waitlistEntryList: WaitlistEntryList | null) => WaitlistEntryList | null) => void;
}

export function ManageClassWaitlist(props: ManageClassWaitlistProps): ReactElement {
    const {
        class_level, school_class, students, skill_domains, belts,
        student_belts, waitlistEntryList, setWaitlistEntryList,
    } = props;
    const { t } = useTranslation();

    const { waitlist_entries } = waitlistEntryList;

    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));
    const belt_by_rank = Object.fromEntries(belts.map(belt => [belt.rank, belt]));
    const student_belts_by_student_id = Object.fromEntries(student_belts.map(
        ({student_id, belts: xbelts}) => [student_id, xbelts]
    ));

    const waitlist_by_student_id: {[index: number]: WaitlistEntry[]} = {};
    waitlist_entries.forEach(waitlist_entry => {
        const student_id = waitlist_entry.student_id;
        const student_waitlist = waitlist_by_student_id[student_id];
        if (student_waitlist === undefined) {
            waitlist_by_student_id[student_id] = [waitlist_entry];
        } else {
            student_waitlist.push(waitlist_entry);
        }
    });

    const waitlist_entry_by_domain_by_student: {[index: number]: {
        [index: number]: WaitlistEntry,
    }} = {};
    students.forEach(student => {
        const student_waitlist = waitlist_by_student_id[student.id];
        let waitlist_by_domain = {};
        if (student_waitlist) {
            waitlist_by_domain = Object.fromEntries(student_waitlist.map(
                waitlist_entry => [waitlist_entry.skill_domain_id, waitlist_entry]
            ));
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
            cell: info => {
                const student = info.row.original;
                return student.display_name;
            }
        },
    ];

    const [errorMessage, setErrorMessage] = useState('');

    const sorted_skill_domains = skill_domains.sort((a, b) => a.code.localeCompare(b.code));
    sorted_skill_domains.forEach(skill_domain => columns.push({
        id: skill_domain.name,
        header: skill_domain.name,
        cell: info => {
            const student = info.row.original;
            const this_belts = student_belts_by_student_id[student.id];
            let belt_id = undefined;
            if (this_belts !== undefined) {
                this_belts.forEach(({belt_id: xbelt_id, skill_domain_id}) => {
                    if (skill_domain_id === skill_domain.id) {
                        belt_id = xbelt_id;
                    }
                });
            }

            const belt = belt_id ? belt_by_id[belt_id] : undefined;
            const next_belt = belt ? belt_by_rank[belt.rank + 1] : belt_by_rank[1];
            if (!next_belt) {
                return null;
            }
            const waitlist_entry_bydomain = waitlist_entry_by_domain_by_student[student.id];
            const waitlist_entry = waitlist_entry_bydomain?.[skill_domain.id];
            return <ManageClassWaitlistButton
                student={student}
                belt={next_belt}
                skill_domain={skill_domain}
                waitlist_entry={waitlist_entry}
                setErrorMessage={setErrorMessage}
                onCreate={(new_waitlist_entry) => {
                    setWaitlistEntryList(lastWaitlistEntryList => {
                        if (lastWaitlistEntryList === null) {
                            return null;
                        }
                        const { waitlist_entries: last_waitlist_entries } = lastWaitlistEntryList;
                        const new_waitlist_entries = [...last_waitlist_entries];
                        new_waitlist_entries.push(new_waitlist_entry);
                        return {...lastWaitlistEntryList, waitlist_entries: new_waitlist_entries};
                    });
                }}
                onDelete={() => {
                    setWaitlistEntryList(lastWaitlistEntryList => {
                        if (lastWaitlistEntryList === null) {
                            return null;
                        }
                        if (waitlist_entry === undefined) {
                            return null;
                        }
                        const { waitlist_entries: last_waitlist_entries } = lastWaitlistEntryList;
                        const index = last_waitlist_entries.findIndex(candidate => candidate.id === waitlist_entry.id);
                        if (index === undefined) {
                            return null;
                        }
                        const new_waitlist_entries = [...last_waitlist_entries];
                        new_waitlist_entries.splice(index, 1);
                        return {...waitlistEntryList, waitlist_entries: new_waitlist_entries};
                    });
                }}
            />;
        },
    }));

    const sorting = [
        {
            id: 'rank',
            desc: false,
        },
        {
            id: 'display_name',
            desc: false,
        }
    ];

    // similar to ModalButton, except no form or cancel/confirm buttons
    const i18nPrefix = 'waitlist.manage';
    const i18nArgs = {class_level, school_class};
    const [show, setShow] = useState(false);

    return <>
        <OverlayTrigger overlay={<Tooltip>{t(i18nPrefix + '.button.tooltip', i18nArgs)}</Tooltip>}>
            <Button onClick={() => setShow(true)}>{t(i18nPrefix + '.button', i18nArgs)}</Button>
        </OverlayTrigger>
        <Modal size="xl" show={show} onHide={() => setShow(false)} scrollable>
            <Modal.Header>
                <Modal.Title>{t(i18nPrefix + '.title', i18nArgs)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                <SortTable data={students} columns={columns} initialSorting={sorting} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    {t(i18nPrefix + '.close', i18nArgs)}
                </Button>
            </Modal.Footer>
        </Modal>
    </>;
}
