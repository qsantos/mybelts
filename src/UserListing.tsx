import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import { User } from './api';
import UserEditButton from './UserEditButton';
import UserDeleteButton from './UserDeleteButton';

interface RowProps {
    user: User;
    setUsers: Dispatch<(prevUsers: User[]) => User[]>;
}

function UserRow_(props: RowProps) {
    const { user, setUsers } = props;

    const changedCallback = (nextUser: User) =>
        setUsers((prevUsers) => {
            const index = prevUsers.findIndex(
                (otherUser) => otherUser.id === nextUser.id
            );
            if (index === null) {
                return prevUsers;
            }
            const nextUsers = [...prevUsers];
            nextUsers[index] = nextUser;
            return nextUsers;
        });

    const deletedCallback = (user_id: number) =>
        setUsers((prevUsers) => {
            const index = prevUsers.findIndex(
                (otherUser) => otherUser.id === user_id
            );
            if (index === null) {
                return prevUsers;
            }
            const nextUsers = [...prevUsers];
            nextUsers.splice(index, 1);
            return nextUsers;
        });

    return (
        <tr key={user.id}>
            <td>{user.username}</td>
            <td>{user.is_admin ? '✅' : '❌'}</td>
            <td>
                <UserEditButton user={user} changedCallback={changedCallback} />{' '}
                <UserDeleteButton
                    user={user}
                    deletedCallback={deletedCallback}
                />
            </td>
        </tr>
    );
}

const UserRow = React.memo(UserRow_);

interface Props {
    users: User[];
    setUsers: Dispatch<(prevUsers: User[]) => User[]>;
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
                    {users.map((user) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            setUsers={setUsers}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    );
}
