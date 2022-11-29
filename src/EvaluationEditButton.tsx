import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import Form from 'react-bootstrap/Form';

import {
    Belt,
    Evaluation,
    SkillDomain,
    Student,
    EvaluationsService,
} from './api';
import { ModalButton } from './ModalButton';

interface Option {
    value: number;
    label: string;
}

interface Props {
    evaluation: Evaluation;
    student: Student;
    skill_domain: SkillDomain;
    belt: Belt;
    skill_domain_options: Option[];
    belt_options: Option[];
    changedCallback?: (changed_evaluation: Evaluation) => void;
}

export function EvaluationEditButton(props: Props): ReactElement {
    const {
        evaluation,
        student,
        skill_domain,
        belt,
        skill_domain_options,
        belt_options,
        changedCallback,
    } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="evaluation.edit"
            i18nArgs={{ student, skill_domain, belt }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    skill_domain: { value: string };
                    belt: { value: string };
                    date: { value: string };
                    success: { checked: boolean };
                };
                return EvaluationsService.putEvaluationResource(evaluation.id, {
                    skill_domain_id: parseInt(typed_form.skill_domain.value),
                    belt_id: parseInt(typed_form.belt.value),
                    date: typed_form.date.value,
                    success: typed_form.success.checked,
                });
            }}
            onResponse={({ evaluation: changed_evaluation }) =>
                changedCallback?.(changed_evaluation)
            }
        >
            <Form.Group controlId="skill_domain">
                <Form.Label>
                    {t('evaluation.add_edit.skill_domain.title')}
                </Form.Label>
                <Select
                    id="skill_domain"
                    name="skill_domain"
                    options={skill_domain_options}
                    defaultValue={{
                        value: evaluation.skill_domain_id,
                        label: skill_domain.name,
                    }}
                />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.skill_domain.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="belt">
                <Form.Label>{t('evaluation.add_edit.belt.title')}</Form.Label>
                <Select
                    id="belt"
                    name="belt"
                    options={belt_options}
                    defaultValue={{
                        value: evaluation.belt_id,
                        label: belt.name,
                    }}
                />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.belt.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="date">
                <Form.Label>{t('evaluation.add_edit.date.title')}</Form.Label>
                <Form.Control type="date" defaultValue={evaluation.date} />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.date.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="success">
                <Form.Check
                    label={t('evaluation.add_edit.passed.title')}
                    defaultChecked={evaluation.success}
                />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.passed.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
