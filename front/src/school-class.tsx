import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { ClassLevel, SchoolClass, SchoolClassesService, Student, SkillDomain, Belt, WaitlistEntry } from './api';
import { AdminOnly } from './auth';
import { BeltIcon } from './belt';
import { joinArray } from './lib';
import { ModalButton } from './modal-button';

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

interface SchoolClassWaitlistProps {
    students: Student[],
    skill_domains: SkillDomain[],
    belts: Belt[],
    waitlist_entries: WaitlistEntry[],
}

export function SchoolClassWaitlist(props: SchoolClassWaitlistProps): (ReactElement | null) {
    const { students, skill_domains, belts, waitlist_entries } = props;

    if (!waitlist_entries) {
        return null;
    }

    const { t } = useTranslation();

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

    return (
        <Alert>
            <Alert.Heading>
                <img src="/evaluation.png" height="30" />
                {' '}
                {t('waitlist.title', {
                    student_count: Object.keys(waitlist_by_student_id).length,
                    evaluation_count: waitlist_entries.length,
                })}
            </Alert.Heading>
            <ul>
                {Object.entries(waitlist_by_student_id).map(([student_id, student_waitlist_entries]) => {
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
        </Alert>
    );
}
