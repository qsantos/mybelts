import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Belt, BeltsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    belt: Belt;
    deletedCallback?: (belt_id: number) => void;
}

export default function BeltDeleteButton(props: Props): ReactElement {
    const { belt, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="belt.delete"
            i18nArgs={{ belt }}
            onSubmit={() => BeltsService.deleteBeltResource(belt.id)}
            onResponse={() => deletedCallback?.(belt.id)}
        >
            {t('belt.delete.message', { belt })}
        </ModalButton>
    );
}
