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
import Tooltip from 'react-bootstrap/Tooltip';
import { ColumnDef } from '@tanstack/react-table';

import { Student, StudentsService } from './api';
import { is_admin } from './auth';
import { getAPIError } from './lib';
import { SortTable } from './sort-table';

interface CreateStudentButtonProps {
    school_class_id: number;
    createdCallback?: (student: Student) => void;
}

export function CreateStudentButton(props : CreateStudentButtonProps): ReactElement {
    const { school_class_id, createdCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        StudentsService.postStudentsResource({
            school_class_id: school_class_id,
            name: target.name.value,
        }).then(({ student }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(student);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.add.button.tooltip')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>{t('student.add.button')}</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('student.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.name.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('student.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface EditStudentButtonProps
{
    student: Student;
    changedCallback?: (changed_student: Student) => void
}

export function EditStudentButton(props : EditStudentButtonProps): ReactElement {
    const { student, changedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
            rank: {value: string};
        };
        StudentsService.putStudentResource(student.id, {
            name: target.name.value,
            rank: parseInt(target.rank.value),
        }).then(({ student: changed_student }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_student);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.edit.title')}: {student.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('student.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.name.placeholder')} defaultValue={student.name} />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="rank">
                        <Form.Label>{t('student.add_edit.rank.title')}</Form.Label>
                        <Form.Control type="number" placeholder={t('student.add_edit.rank.placeholder')} defaultValue={student.rank} />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.rank.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.edit.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteStudentButtonProps
{
    student: Student;
    deletedCallback?: () => void;
}

export function DeleteStudentButton(props : DeleteStudentButtonProps): ReactElement {
    const { student, deletedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        StudentsService.deleteStudentResource(student.id).then(() => {
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
        <OverlayTrigger overlay={<Tooltip>{t('student.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('student.delete.title')}: {student.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                {t('student.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('student.delete.cancel')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('student.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('student.delete.confirm')}</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface UpdateStudentRanksProps {
    students: Student[],
    changedCallback?: (changed_students: Student[]) => void
}

export function UpdateStudentRanks(props: UpdateStudentRanksProps): ReactElement {
    const { students, changedCallback } = props;
    const { t } = useTranslation();

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [updating, setUpdating] = useState(false);

    const firstElementRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        const element = firstElementRef.current;
        if (element !== null) {
            element.focus();
        }
    }, [show]);

    function handleSubmit(event: FormEvent) {
        setUpdating(true);
        const target = event.target as typeof event.target & {
            rank: HTMLInputElement[];
        };
        const inputElements = [...target.rank];
        const new_student_ranks = inputElements.map((inputElement: HTMLInputElement) => {
            return {
                id: parseInt(inputElement.getAttribute('data-student-id') || '0'),
                rank: parseInt(inputElement.value || '0'),
            };
        });
        const updates = {
            students: new_student_ranks,
        };
        StudentsService.putStudentsResource(updates).then(({ students: changed_students }) => {
            setShow(false);
            setUpdating(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_students);
            }
        }).catch(error => {
            setUpdating(false);
            setErrorMessage(getAPIError(error));
        });
        event.preventDefault();
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.update_ranks.button.tooltip')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>{t('student.update_ranks.button')}</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.update_ranks.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    {students.map((student, index) =>
                        <Form.Group controlId="rank" key={student.id} className="mb-3">
                            <Form.Label>{student.name}</Form.Label>
                            <Form.Control
                                type="number"
                                defaultValue={student.rank}
                                onFocus={event => event.target.select()}
                                ref={index == 0 ? firstElementRef : null}
                                data-student-id={student.id}
                            />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.update_ranks.cancel')}</Button>
                    {updating
                        ? <Button disabled variant="danger">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.update_ranks.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.update_ranks.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface StudentListingProps {
    students: Student[];
    setStudents: (students: Student[]) => void;
}

export function StudentListing(props: StudentListingProps): ReactElement {
    const { students, setStudents } = props;
    const { t } = useTranslation();

    const columns: ColumnDef<Student>[] = [
        {
            id: 'rank',
            header: t('student.list.rank.title'),
            accessorKey: 'rank',
        },
        {
            id: 'name',
            header: t('student.list.name.title'),
            accessorKey: 'name',
            cell: info => {
                const student = info.row.original;
                return (
                    <Nav.Link as={Link} to={'/students/' + student.id}>
                        {student.name}
                    </Nav.Link>
                );
            },
        },
    ];

    if (is_admin()) {
        columns.push({
            id: 'actions',
            header: t('student.list.actions.title'),
            cell: info => {
                const student = info.row.original;
                return <>
                    <EditStudentButton student={student} changedCallback={new_student => {
                        const new_students = [...students];
                        new_students[info.row.index] = new_student;
                        setStudents(new_students);
                    }} />
                    {' '}
                    <DeleteStudentButton student={student} deletedCallback={() => {
                        const new_students = [...students];
                        new_students.splice(info.row.index, 1);
                        setStudents(new_students);
                    }} />
                </>;
            }
        });
    }

    const sorting = [
        {
            id: 'rank',
            desc: false,
        },
    ];
    return <SortTable data={students} columns={columns} initialSorting={sorting} />;
}
