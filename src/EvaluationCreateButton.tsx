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
import ModalButton from './ModalButton';

interface Props {
    student: Student;
    skill_domains: SkillDomain[];
    belts: Belt[];
    createdCallback?: (belt_attempt: Evaluation) => void;
}

export default function EvaluationCreateButton(props: Props): ReactElement {
    const { student, skill_domains, belts, createdCallback } = props;
    const { t } = useTranslation();

    const sorted_skill_domains = skill_domains.sort((a, b) =>
        a.code.localeCompare(b.code)
    );
    const sorted_belts = belts.sort((a, b) => a.rank - b.rank);

    const skill_domain_options = sorted_skill_domains.map((skill_domain) => ({
        value: skill_domain.id,
        label: skill_domain.name,
    }));

    const belt_options = sorted_belts.map((belt) => ({
        value: belt.id,
        label: belt.name,
    }));

    return (
        <ModalButton
            i18nPrefix="evaluation.add"
            i18nArgs={{ student }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    skill_domain: { value: string };
                    belt: { value: string };
                    date: { value: string };
                    success: { checked: boolean };
                };
                return EvaluationsService.postEvaluationsResource({
                    student_id: student.id,
                    skill_domain_id: parseInt(typed_form.skill_domain.value),
                    belt_id: parseInt(typed_form.belt.value),
                    date: typed_form.date.value,
                    success: typed_form.success.checked,
                });
            }}
            onResponse={({ evaluation }) => createdCallback?.(evaluation)}
        >
            <Form.Group controlId="skill_domain">
                <Form.Label>
                    {t('evaluation.add_edit.skill_domain.title')}
                </Form.Label>
                <Select
                    id="skill_domain"
                    name="skill_domain"
                    options={skill_domain_options}
                />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.skill_domain.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="belt">
                <Form.Label>{t('evaluation.add_edit.belt.title')}</Form.Label>
                <Select id="belt" name="belt" options={belt_options} />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.belt.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="date">
                <Form.Label>{t('evaluation.add_edit.date.title')}</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.date.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="success">
                <Form.Check label={t('evaluation.add_edit.passed.title')} />
                <Form.Text className="text-muted">
                    {t('evaluation.add_edit.passed.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
