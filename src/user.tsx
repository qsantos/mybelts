import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import { User, UsersService } from './api';
import { ModalButton } from './modal-button';

interface CreateUserButtonProps {
    createdCallback?: (user: User) => void;
}

export function CreateUserButton(props: CreateUserButtonProps): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="user.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    username: { value: string };
                    password: { value: string };
                    is_admin: { checked: boolean };
                };
                return UsersService.postUsersResource({
                    username: typed_form.username.value,
                    password: typed_form.password.value,
                    is_admin: typed_form.is_admin.checked,
                });
            }}
            onResponse={({ user }) => createdCallback?.(user)}
        >
            <Form.Group controlId="username">
                <Form.Label>{t('user.add_edit.username.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('user.add_edit.username.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('user.add_edit.username.help')}
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
                <Form.Check label={t('user.add_edit.is_admin.title')} />
                <Form.Text className="text-muted">
                    {t('user.add_edit.is_admin.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface EditUserButtonProps {
    user: User;
    changedCallback?: (changed_user: User) => void;
}

export function EditUserButton(props: EditUserButtonProps): ReactElement {
    const { user, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="user.edit"
            i18nArgs={{ user }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    username: { value: string };
                    password: { value: string };
                    is_admin: { checked: boolean };
                };
                return UsersService.putUserResource(user.id, {
                    username: typed_form.username.value,
                    password: typed_form.password.value,
                    is_admin: typed_form.is_admin.checked,
                });
            }}
            onResponse={({ user: changed_user }) =>
                changedCallback?.(changed_user)
            }
        >
            <Form.Group controlId="username">
                <Form.Label>{t('user.add_edit.username.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('user.add_edit.username.placeholder')}
                    defaultValue={user.username}
                />
                <Form.Text className="text-muted">
                    {t('user.add_edit.username.help')}
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
                <Form.Check
                    label={t('user.add_edit.is_admin.title')}
                    defaultChecked={user.is_admin}
                />
                <Form.Text className="text-muted">
                    {t('user.add_edit.is_admin.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface DeleteUserButtonProps {
    user: User;
    deletedCallback?: () => void;
}

export function DeleteUserButton(props: DeleteUserButtonProps): ReactElement {
    const { user, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="user.delete"
            i18nArgs={{ user }}
            onSubmit={() => UsersService.deleteUserResource(user.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('user.delete.message', { user })}
        </ModalButton>
    );
}

interface UserListingProps {
    users: User[];
    setUsers: (users: User[]) => void;
}

export function UserListing(props: UserListingProps): ReactElement {
    const { users, setUsers } = props;
    const { t } = useTranslation();
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>{t('user.list.username.title')}</th>
                        <th>{t('user.list.is_admin.title')}</th>
                        <th>{t('user.list.actions.title')}</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.is_admin ? '✅' : '❌'}</td>
                            <td>
                                <EditUserButton
                                    user={user}
                                    changedCallback={(new_user) => {
                                        const new_users = [...users];
                                        new_users[index] = new_user;
                                        setUsers(new_users);
                                    }}
                                />{' '}
                                <DeleteUserButton
                                    user={user}
                                    deletedCallback={() => {
                                        const new_users = [...users];
                                        new_users.splice(index, 1);
                                        setUsers(new_users);
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}
