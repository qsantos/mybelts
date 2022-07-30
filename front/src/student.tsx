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
import { ColumnDef } from '@tanstack/react-table';

import { Student, StudentsService } from './api';
import { SortTable } from './sort-table';

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
        <OverlayTrigger overlay={<Tooltip>Add a new student to the class</Tooltip>}>
            <Button onClick={() => setShow(true)}>Add</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: John Doe" />
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
                    <Form.Group controlId="rank">
                        <Form.Label>Rank</Form.Label>
                        <Form.Control type="number" placeholder="Example: 7" defaultValue={student.rank} />
                        <Form.Text className="text-muted">
                            New rank for the student “{student.name}”
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

interface UpdateStudentRanksProps {
    students: Student[],
    changedCallback?: (changed_students: Student[]) => void
}

export function UpdateStudentRanks(props: UpdateStudentRanksProps): ReactElement {
    const { students, changedCallback } = props;

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
            setErrorMessage(error.body.message);
        });
        event.preventDefault();
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Quickly change the ranks of all students</Tooltip>}>
            <Button onClick={() => setShow(true)}>Update Ranks</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Delete Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
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
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {updating
                        ? <Button disabled variant="danger">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Deleting</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Save</Button>
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
    const navigate = useNavigate();

    const columns = React.useMemo<ColumnDef<Student>[]>(
        () => [
            {
                header: 'Rank',
                accessorKey: 'rank',
            },
            {
                header: 'Name',
                accessorKey: 'name',
                cell: info => {
                    const student = info.row.original;
                    return (
                        <Nav.Link as={Link} to={`/students/${student.id}`}>
                            {student.name}
                        </Nav.Link>
                    );
                },
            },
            {
                header: 'Action',
                cell: info => {
                    const student = info.row.original;
                    return <>
                        <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
                            <Button onClick={() => navigate(`/students/${student.id}`)}>🔍</Button>
                        </OverlayTrigger>
                        {' '}
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
                },
            },
        ],
        [],
    );

    const sorting = [
        {
            id: 'rank',
            desc: false,
        },
    ];
    return <SortTable data={students} columns={columns} initialSorting={sorting} />;
}
