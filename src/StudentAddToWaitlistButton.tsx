import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { BeltIcon } from './BeltIcon';

import {
    Belt,
    SkillDomain,
    Student,
    WaitlistEntry,
    StudentsService,
} from './api';
import { ModalButton } from './ModalButton';

interface Props {
    student: Student;
    skill_domain: SkillDomain;
    belt: Belt;
    addedCallback: (waitlist_entry: WaitlistEntry) => void;
}

export function StudentAddToWaitlistButton(props: Props): ReactElement {
    const { student, skill_domain, belt, addedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="success"
            i18nPrefix="student.waitlist.add"
            i18nArgs={{ student, skill_domain, belt }}
            onSubmit={() =>
                StudentsService.postStudentWaitlistResource(student.id, {
                    skill_domain_id: skill_domain.id,
                    belt_id: belt.id,
                })
            }
            onResponse={({ waitlist_entry }) => addedCallback(waitlist_entry)}
        >
            {t('student.waitlist.add.message', {
                student: student.display_name,
                belt: belt.name.toLowerCase(),
                skill_domain: skill_domain.name.toLowerCase(),
            })}
            <br />
            <br />
            <BeltIcon belt={belt} /> <strong>{skill_domain.name}</strong>
        </ModalButton>
    );
}
