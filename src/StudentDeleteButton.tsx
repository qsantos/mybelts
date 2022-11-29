import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Student, StudentsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    student: Student;
    deletedCallback?: () => void;
}

export default function StudentDeleteButton(props: Props): ReactElement {
    const { student, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="student.delete"
            i18nArgs={{ student }}
            onSubmit={() => StudentsService.deleteStudentResource(student.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('student.delete.message', { student })}
        </ModalButton>
    );
}
