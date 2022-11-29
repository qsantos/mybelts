import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Belt, BeltsService } from './api';
import { ModalButton } from './ModalButton';

interface Props {
    belt: Belt;
    deletedCallback?: () => void;
}

export function BeltDeleteButton(props: Props): ReactElement {
    const { belt, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="belt.delete"
            i18nArgs={{ belt }}
            onSubmit={() => BeltsService.deleteBeltResource(belt.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('belt.delete.message', { belt })}
        </ModalButton>
    );
}
