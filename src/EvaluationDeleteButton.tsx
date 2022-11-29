import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Belt,
    Evaluation,
    SkillDomain,
    Student,
    EvaluationsService,
} from './api';
import { ModalButton } from './ModalButton';

interface Props {
    student: Student;
    skill_domain: SkillDomain;
    belt: Belt;
    evaluation: Evaluation;
    deletedCallback?: () => void;
}

export function EvaluationDeleteButton(props: Props): ReactElement {
    const { student, skill_domain, belt, evaluation, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nArgs={{ student, skill_domain, belt }}
            variant="danger"
            i18nPrefix="evaluation.delete"
            onSubmit={() =>
                EvaluationsService.deleteEvaluationResource(evaluation.id)
            }
            onResponse={() => deletedCallback?.()}
        >
            {t('evaluation.delete.message', { student, skill_domain, belt })}
        </ModalButton>
    );
}
