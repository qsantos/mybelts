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
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

import { SchoolClass, SchoolClassesService } from './api';

interface CreateSchoolClassButtonProps
{
    class_level_id: number;
    createdCallback?: (school_class: SchoolClass) => void;
}

export function CreateSchoolClassButton(props : CreateSchoolClassButtonProps): ReactElement {
    const { class_level_id, createdCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Class</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="suffix">
                        <Form.Label>Suffix</Form.Label>
                        <Form.Control type="text" placeholder="Example: D" />
                        <Form.Text className="text-muted">
                            Suffix for the new class
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

interface EditSchoolClassButtonProps
{
    school_class: SchoolClass;
    changedCallback?: (changed_school_class: SchoolClass) => void;
}

export function EditSchoolClassButton(props : EditSchoolClassButtonProps): ReactElement {
    const { school_class, changedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
                    <Modal.Title>Edit Class</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="suffix">
                        <Form.Label>Suffix</Form.Label>
                        <Form.Control type="text" placeholder="Example: D" defaultValue={school_class.suffix} />
                        <Form.Text className="text-muted">
                            New suffix for the class “{school_class.suffix}”
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

interface DeleteSchoolClassButtonProps
{
    school_class: SchoolClass;
    deletedCallback?: () => void;
}

export function DeleteSchoolClassButton(props : DeleteSchoolClassButtonProps): ReactElement {
    const { school_class, deletedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Class</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                Are you sure you want to delete the class “{school_class.suffix}”?
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

interface SchoolClassListingProps {
    school_classes: SchoolClass[];
    setSchoolClasses: (school_classes: SchoolClass[]) => void;
}

export function SchoolClassListing(props: SchoolClassListingProps): ReactElement {
    const { school_classes, setSchoolClasses } = props;
    const navigate = useNavigate();
    return <>
        <Table>
            <thead>
                <tr>
                    <th>Suffix</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {school_classes.map((school_class, index) =>
                    <tr key={school_class.id}>
                        <td>
                            <Nav.Link as={Link} to={`/school-classes/${school_class.id}`}>
                                {school_class.suffix}
                            </Nav.Link>
                        </td>
                        <td>
                            <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
                                <Button onClick={() => navigate(`/school-classes/${school_class.id}`)}>🔍</Button>
                            </OverlayTrigger>
                            {' '}
                            <EditSchoolClassButton school_class={school_class} changedCallback={new_school_class => {
                                school_classes[index] = new_school_class;
                                setSchoolClasses(school_classes);
                            }} />
                            {' '}
                            <DeleteSchoolClassButton school_class={school_class} deletedCallback={() => {
                                school_classes.splice(index, 1);
                                setSchoolClasses(school_classes);
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}
