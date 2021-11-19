import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Student, StudentsService } from './api';
import './index.css';

interface CreateStudentButtonProps {
    school_class_id: number;
    createdCallback?: (student: Student) => void;
}

export function CreateStudentButton(props : CreateStudentButtonProps): ReactElement {
    const { school_class_id, createdCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>Suffix</Form.Label>
                        <Form.Control type="text" placeholder="Example: D" />
                        <Form.Text className="text-muted">
                            Name for the new student
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Creating</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Add</Button>
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
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        StudentsService.putStudentResource(student.id, {
            name: target.name.value,
        }).then(({ student: changed_student }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_student);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>Suffix</Form.Label>
                        <Form.Control type="text" placeholder="Example: John Doe" defaultValue={student.name} />
                        <Form.Text className="text-muted">
                            New name for the student “{student.name}”
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Saving</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Save</Button>
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
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Student</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                Are you sure you want to delete the student “{student.name}”?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">Deleting</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>Delete</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface StudentListingProps {
    students: Student[];
    setStudents: (students: Student[]) => void;
}

export function StudentListing(props: StudentListingProps): ReactElement {
    const { students, setStudents } = props;
    const navigate = useNavigate();
    return <>
        <Table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {students.map((student, index) =>
                    <tr key={student.id}>
                        <td>
                            <Nav.Link as={Link} to={`/students/${student.id}`}>
                                {student.name}
                            </Nav.Link>
                        </td>
                        <td>
                            <Button onClick={() => navigate(`/students/${student.id}`)}>🔍</Button>
                            {' '}
                            <EditStudentButton student={student} changedCallback={new_student => {
                                students[index] = new_student;
                                setStudents(students);
                            }} />
                            {' '}
                            <DeleteStudentButton student={student} deletedCallback={() => {
                                students.splice(index, 1);
                                setStudents(students);
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}
