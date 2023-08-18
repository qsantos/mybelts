import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { User, UsersService } from './api';
import ModalButton from './ModalButton';

interface Props {
    createdCallback?: (user: User) => void;
}

export default function UserCreateButton(props: Props): ReactElement {
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
