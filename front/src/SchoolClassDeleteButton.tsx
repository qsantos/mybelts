import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Level, SchoolClass, SchoolClassesService } from './api';
import ModalButton from './ModalButton';

interface Props {
    level: Level;
    school_class: SchoolClass;
    deletedCallback?: (school_class_id: number) => void;
}

export default function SchoolClassDeleteButton(props: Props): ReactElement {
    const { level, school_class, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="school_class.delete"
            i18nArgs={{ level, school_class }}
            onSubmit={() =>
                SchoolClassesService.deleteSchoolClassResource(school_class.id)
            }
            onResponse={() => deletedCallback?.(school_class.id)}
        >
            {t('school_class.delete.message', { level, school_class })}
        </ModalButton>
    );
}
