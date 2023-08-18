import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassLevel, SchoolClass, SchoolClassesService } from './api';
import ModalButton from './ModalButton';

interface Props {
    class_level: ClassLevel;
    school_class: SchoolClass;
    deletedCallback?: (school_class_id: number) => void;
}

export default function SchoolClassDeleteButton(props: Props): ReactElement {
    const { class_level, school_class, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="school_class.delete"
            i18nArgs={{ class_level, school_class }}
            onSubmit={() =>
                SchoolClassesService.deleteSchoolClassResource(school_class.id)
            }
            onResponse={() => deletedCallback?.(school_class.id)}
        >
            {t('school_class.delete.message', { class_level, school_class })}
        </ModalButton>
    );
}
