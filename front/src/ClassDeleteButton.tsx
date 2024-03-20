import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Level, Class, ClassesService } from './api';
import ModalButton from './ModalButton';

interface Props {
    level: Level;
    class: Class;
    deletedCallback?: (class_id: number) => void;
}

export default function ClassDeleteButton(props: Props): ReactElement {
    const { level, class: class_, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="class.delete"
            i18nArgs={{ level, class: class_ }}
            onSubmit={() =>
                ClassesService.deleteClassResource(class_.id)
            }
            onResponse={() => deletedCallback?.(class_.id)}
        >
            {t('class.delete.message', { level, class: class_ })}
        </ModalButton>
    );
}
