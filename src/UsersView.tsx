import React from 'react';
import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { UserList, UsersService } from './api';
import { getAPIError } from './lib';
import UserListing from './UserListing';
import UserCreateButton from './UserCreateButton';
import { BreadcrumbItem, Loader } from './index';

export default function UsersView(): ReactElement {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [userList, setUserList] = useState<null | UserList>(null);

    useEffect(() => {
        UsersService.getUsersResource()
            .then(setUserList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, []);

    if (userList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem active href="/users">
                        {t('user.list.title.primary')}
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('user.list.title.primary')}</h3>
                {errorMessage ? (
                    <Alert variant="danger">
                        {t('error')}: {errorMessage}
                    </Alert>
                ) : (
                    <Loader />
                )}
            </>
        );
    }

    const { users } = userList;

    const sorted_users = users.sort((a, b) =>
        a.username.localeCompare(b.username)
    );

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/users">
                    {t('user.list.title.primary')}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('user.list.title.primary')}</h3>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <UserCreateButton
                createdCallback={(new_user) => {
                    setUserList({ ...userList, users: [...users, new_user] });
                }}
            />
            <h4>{t('user.list.title.secondary')}</h4>
            <UserListing
                users={sorted_users}
                setUsers={(new_users) =>
                    setUserList({ ...userList, users: new_users })
                }
            />
        </>
    );
}
