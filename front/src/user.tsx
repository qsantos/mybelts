import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
        <Button onClick={() => setShow(true)}>{t('user.add.button')}</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('user.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('user.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('user.add_edit.name.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('user.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>{t('user.add_edit.password.title')}</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            {t('user.add_edit.password.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="is_admin">
                        <Form.Check label={t('user.add_edit.is_admin.title')}/>
                        <Form.Text className="text-muted">
                            {t('user.add_edit.is_admin.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('user.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('user.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('user.add.confirm')}</Button>
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
    const { t } = useTranslation();
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
        <OverlayTrigger overlay={<Tooltip>{t('user.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('user.edit.title')}: {user.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('user.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('user.add_edit.name.placeholder')} defaultValue={user.name} />
                        <Form.Text className="text-muted">
                            {t('user.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>{t('user.add_edit.password.title')}</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            {t('user.add_edit.password.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="is_admin">
                        <Form.Check label={t('user.add_edit.is_admin.title')} defaultChecked={user.is_admin} />
                        <Form.Text className="text-muted">
                            {t('user.add_edit.is_admin.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('user.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('user.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('user.edit.confirm')}</Button>
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
    const { t } = useTranslation();
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
        <OverlayTrigger overlay={<Tooltip>{t('user.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('user.delete.title')}: {user.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                {t('user.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('user.delete.cancel')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('user.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('user.delete.confirm')}</Button>
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
    const { t } = useTranslation();
    return <>
        <Table>
            <thead>
                <tr>
                    <th>{t('user.list.name.title')}</th>
                    <th>{t('user.list.is_admin.title')}</th>
                    <th>{t('user.list.actions.title')}</th>
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
