import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import { User } from './api';
import UserEditButton from './UserEditButton';
import UserDeleteButton from './UserDeleteButton';

interface Props {
    users: User[];
    setUsers: (users: User[]) => void;
}

export default function UserListing(props: Props): ReactElement {
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
                                <UserEditButton
                                    user={user}
                                    changedCallback={(new_user) => {
                                        const new_users = [...users];
                                        new_users[index] = new_user;
                                        setUsers(new_users);
                                    }}
                                />{' '}
                                <UserDeleteButton
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
