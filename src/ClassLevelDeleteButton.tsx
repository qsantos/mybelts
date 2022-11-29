import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassLevel, ClassLevelsService } from './api';
import { ModalButton } from './ModalButton';

interface DeleteClassLevelButtonProps {
    class_level: ClassLevel;
    deletedCallback?: () => void;
}

export function ClassLevelDeleteButton(
    props: DeleteClassLevelButtonProps
): ReactElement {
    const { class_level, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="class_level.delete"
            i18nArgs={{ class_level }}
            onSubmit={() =>
                ClassLevelsService.deleteClassLevelResource(class_level.id)
            }
            onResponse={() => deletedCallback?.()}
        >
            {t('class_level.delete.message', { class_level })}
        </ModalButton>
    );
}
