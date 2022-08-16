import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';

import { Student, StudentsService } from './api';
import { getAPIError } from './lib';

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
            display_name: {value: string};
            username: {value: string};
            password: {value: string};
        };
        StudentsService.postStudentsResource({
            school_class_id: school_class_id,
            display_name: target.display_name.value,
            username: target.username.value,
            password: target.password.value,
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
                    <Form.Group controlId="display_name">
                        <Form.Label>{t('student.add_edit.display_name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.display_name.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('student.add_edit.display_name.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="username">
                        <Form.Label>{t('student.add_edit.username.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.username.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('student.add_edit.username.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>{t('student.add_edit.password.title')}</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.password.help')}
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
            display_name: {value: string};
            username: {value: string};
            password: {value: string};
            rank: {value: string};
        };
        StudentsService.putStudentResource(student.id, {
            display_name: target.display_name.value,
            rank: parseInt(target.rank.value),
            username: target.username.value,
            password: target.password.value,
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
                    <Modal.Title>{t('student.edit.title')}: {student.display_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="display_name">
                        <Form.Label>{t('student.add_edit.display_name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.display_name.placeholder')} defaultValue={student.display_name} />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.display_name.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="rank">
                        <Form.Label>{t('student.add_edit.rank.title')}</Form.Label>
                        <Form.Control type="number" placeholder={t('student.add_edit.rank.placeholder')} defaultValue={student.rank} />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.rank.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="username">
                        <Form.Label>{t('student.add_edit.username.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.username.placeholder')} defaultValue={student.username} />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.username.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>{t('student.add_edit.password.title')}</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.password.help')}
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
                <Modal.Title>{t('student.delete.title')}: {student.display_name}</Modal.Title>
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
                            <Form.Label>{student.display_name}</Form.Label>
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
