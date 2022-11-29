import React from 'react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import {
    Belt,
    SkillDomain,
    Student,
    StudentsService,
    WaitlistEntry,
    WaitlistService,
} from './api';
import { getAPIError } from './lib';
import { BeltIcon } from './BeltIcon';

interface Props {
    student: Student;
    skill_domain: SkillDomain;
    belt: Belt;
    waitlist_entry?: WaitlistEntry;
    setErrorMessage: (error: string) => void;
    onCreate?: (waitlistEntryList: WaitlistEntry) => void;
    onDelete?: () => void;
}

export function SchoolClassManageWaitlistButton(props: Props): ReactElement {
    const {
        student,
        skill_domain,
        belt,
        waitlist_entry,
        setErrorMessage,
        onCreate,
        onDelete,
    } = props;
    const { t } = useTranslation();

    const [in_process, setIn_process] = useState(false);
    function handleClick() {
        setIn_process(true);
        setErrorMessage('');
        if (waitlist_entry) {
            WaitlistService.deleteWaitlistResource(waitlist_entry.id)
                .then(() => {
                    setIn_process(false);
                    onDelete?.();
                })
                .catch((error) => {
                    setIn_process(false);
                    setErrorMessage(getAPIError(error));
                });
        } else {
            StudentsService.postStudentWaitlistResource(student.id, {
                skill_domain_id: skill_domain.id,
                belt_id: belt.id,
            })
                .then(({ waitlist_entry: new_waitlist_entry }) => {
                    setIn_process(false);
                    onCreate?.(new_waitlist_entry);
                })
                .catch((error) => {
                    setIn_process(false);
                    setErrorMessage(getAPIError(error));
                });
        }
    }
    if (in_process) {
        return (
            <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">
                    {t('waitlist.manage.in_process')}
                </span>
            </Spinner>
        );
    } else {
        const variant = waitlist_entry ? 'primary' : 'light';
        return (
            <Button variant={variant} onClick={handleClick}>
                <BeltIcon belt={belt} />
            </Button>
        );
    }
}
