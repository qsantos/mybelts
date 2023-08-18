import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { User, UsersService } from './api';
import ModalButton from './ModalButton';

interface Props {
    user: User;
    changedCallback?: (changed_user: User) => void;
}

export default function UserEditButton(props: Props): ReactElement {
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
