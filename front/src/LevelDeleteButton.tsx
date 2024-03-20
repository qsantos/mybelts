import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Level, LevelsService } from './api';
import ModalButton from './ModalButton';

interface DeleteLevelButtonProps {
    level: Level;
    deletedCallback?: (level_id: number) => void;
}

export default function LevelDeleteButton(
    props: DeleteLevelButtonProps
): ReactElement {
    const { level, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="level.delete"
            i18nArgs={{ level }}
            onSubmit={() =>
                LevelsService.deleteLevelResource(level.id)
            }
            onResponse={() => deletedCallback?.(level.id)}
        >
            {t('level.delete.message', { level })}
        </ModalButton>
    );
}
