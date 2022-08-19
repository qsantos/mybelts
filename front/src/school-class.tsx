import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
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

import { SchoolClass, SchoolClassesService, Student, SkillDomain, Belt, WaitlistEntry } from './api';
import { AdminOnly } from './auth';
import { getAPIError } from './lib';

interface CreateSchoolClassButtonProps
{
    class_level_id: number;
    createdCallback?: (school_class: SchoolClass) => void;
}

export function CreateSchoolClassButton(props : CreateSchoolClassButtonProps): ReactElement {
    const { class_level_id, createdCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            suffix: {value: string};
        };
        SchoolClassesService.postSchoolClassesResource({
            class_level_id: class_level_id,
            suffix: target.suffix.value,
        }).then(({ school_class }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(school_class);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>{t('school_class.add.button')}</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('school_class.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="suffix">
                        <Form.Label>{t('school_class.add_edit.suffix.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('school_class.add_edit.suffix.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('school_class.add_edit.suffix.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('school_class.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('school_class.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('school_class.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface EditSchoolClassButtonProps
{
    school_class: SchoolClass;
    changedCallback?: (changed_school_class: SchoolClass) => void;
}

export function EditSchoolClassButton(props : EditSchoolClassButtonProps): ReactElement {
    const { school_class, changedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            suffix: {value: string};
        };
        SchoolClassesService.putSchoolClassResource(school_class.id, {
            suffix: target.suffix.value,
        }).then(({ school_class: changed_school_class }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_school_class);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('school_class.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('school_class.edit.title')}: {school_class.suffix}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="suffix">
                        <Form.Label>{t('school_class.add_edit.suffix.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('school_class.add_edit.suffix.placeholder')} defaultValue={school_class.suffix} />
                        <Form.Text className="text-muted">
                            {t('school_class.add_edit.suffix.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('school_class.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('school_class.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('school_class.edit.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteSchoolClassButtonProps
{
    school_class: SchoolClass;
    deletedCallback?: () => void;
}

export function DeleteSchoolClassButton(props : DeleteSchoolClassButtonProps): ReactElement {
    const { school_class, deletedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        SchoolClassesService.deleteSchoolClassResource(school_class.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        }).catch(error => {
            setDeleting(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('school_class.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('school_class.delete.title')}: {school_class.suffix}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                {t('school_class.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('school_class.delete.cancel')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('school_class.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('school_class.delete.confirm')}</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface SchoolClassListingProps {
    school_classes: SchoolClass[];
    setSchoolClasses: (school_classes: SchoolClass[]) => void;
}

export function SchoolClassListing(props: SchoolClassListingProps): ReactElement {
    const { school_classes, setSchoolClasses } = props;
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
                                <EditSchoolClassButton school_class={school_class} changedCallback={new_school_class => {
                                    const new_school_classes = [...school_classes];
                                    new_school_classes[index] = new_school_class;
                                    setSchoolClasses(new_school_classes);
                                }} />
                                {' '}
                                <DeleteSchoolClassButton school_class={school_class} deletedCallback={() => {
                                    const new_school_classes = [...school_classes];
                                    new_school_classes.splice(index, 1);
                                    setSchoolClasses(new_school_classes);
                                }} />
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

export function SchoolClassWaitlist(props: SchoolClassWaitlistProps): ReactElement {
    const { students, skill_domains, belts, waitlist_entries } = props;

    if (!waitlist_entries) {
        return <></>;
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
                        return <></>;
                    }
                    return (
                        <li key={student_id}>
                            <div className="ms-2 me-auto">
                                <strong>{student.display_name}:</strong>
                                {student_waitlist_entries.map(({skill_domain_id, belt_id}) => {
                                    const skill_domain = skill_domain_by_id[skill_domain_id];
                                    if (skill_domain === undefined) {
                                        console.error('skill domain ' + skill_domain_id + ' not found');
                                        return <></>;
                                    }
                                    const belt = belt_by_id[belt_id];
                                    if (belt === undefined) {
                                        console.error('belt ' + belt_id + ' not found');
                                        return <></>;
                                    }
                                    return <span key={skill_domain_id}>
                                        {skill_domain.name} ({belt.name})
                                    </span>;
                                })}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Alert>
    );
}
