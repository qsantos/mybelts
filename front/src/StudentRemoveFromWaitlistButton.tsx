import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Belt,
    SkillDomain,
    Student,
    WaitlistEntry,
    WaitlistService,
} from './api';
import BeltIcon from './BeltIcon';
import ModalButton from './ModalButton';

interface Props {
    student: Student;
    skill_domain: SkillDomain;
    belt: Belt;
    waitlist_entry: WaitlistEntry;
    removedCallback: () => void;
}

export default function StudentRemoveFromWaitlistButton(
    props: Props
): ReactElement {
    const { student, skill_domain, belt, waitlist_entry, removedCallback } =
        props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="student.waitlist.remove"
            i18nArgs={{ student, skill_domain, belt }}
            onSubmit={() =>
                WaitlistService.deleteWaitlistResource(waitlist_entry.id)
            }
            onResponse={() => removedCallback?.()}
        >
            {t('student.waitlist.remove.message', {
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
