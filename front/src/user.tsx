import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

import { User, UsersService } from './api';
import { getAPIError } from './lib';

interface CreateUserButtonProps
{
    createdCallback?: (user: User) => void;
}

export function CreateUserButton(props : CreateUserButtonProps): ReactElement {
    const { createdCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
            password: {value: string};
            is_admin: {checked: boolean};
        };
        UsersService.postUsersResource({
            name: target.name.value,
            password: target.password.value,
            is_admin: target.is_admin.checked,
        }).then(({ user }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(user);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: tartempion" />
                        <Form.Text className="text-muted">
                            Name for the new user
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            Password for the new user
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="is_admin">
                        <Form.Check label="Administrator" />
                        <Form.Text className="text-muted">
                            Should the user have administrator privileges?
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

interface EditUserButtonProps
{
    user: User;
    changedCallback?: (changed_user: User) => void;
}

export function EditUserButton(props : EditUserButtonProps): ReactElement {
    const { user, changedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
            password: {value: string};
            is_admin: {checked: boolean};
        };
        UsersService.putUserResource(user.id, {
            name: target.name.value,
            password: target.password.value,
            is_admin: target.is_admin.checked,
        }).then(({ user: changed_user }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_user);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: tartempion" defaultValue={user.name} />
                        <Form.Text className="text-muted">
                            New name for the user
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            New password for the user
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="is_admin">
                        <Form.Check label="Administrator" defaultChecked={user.is_admin} />
                        <Form.Text className="text-muted">
                            Should the user have administrator privileges?
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

interface DeleteUserButtonProps
{
    user: User;
    deletedCallback?: () => void;
}

export function DeleteUserButton(props : DeleteUserButtonProps): ReactElement {
    const { user, deletedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        UsersService.deleteUserResource(user.id).then(() => {
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
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                Are you sure you want to delete the user “{user.name}”?
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

interface UserListingProps {
    users: User[];
    setUsers: (users: User[]) => void;
}

export function UserListing(props: UserListingProps): ReactElement {
    const { users, setUsers } = props;
    return <>
        <Table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Is Admin?</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user, index) =>
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.is_admin ? '✅' : '❌'}</td>
                        <td>
                            <EditUserButton user={user} changedCallback={new_user => {
                                const new_users = [...users];
                                new_users[index] = new_user;
                                setUsers(new_users);
                            }} />
                            {' '}
                            <DeleteUserButton user={user} deletedCallback={() => {
                                const new_users = [...users];
                                new_users.splice(index, 1);
                                setUsers(new_users);
                            }} />
                        </td>
                    </tr>)}
            </tbody>
        </Table>
    </>;
}
