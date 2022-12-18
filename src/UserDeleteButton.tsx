import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { User, UsersService } from './api';
import ModalButton from './ModalButton';

interface Props {
    user: User;
    deletedCallback?: (user_id: number) => void;
}

export default function UserDeleteButton(props: Props): ReactElement {
    const { user, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="user.delete"
            i18nArgs={{ user }}
            onSubmit={() => UsersService.deleteUserResource(user.id)}
            onResponse={() => deletedCallback?.(user.id)}
        >
            {t('user.delete.message', { user })}
        </ModalButton>
    );
}
