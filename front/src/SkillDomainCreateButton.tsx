import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { SkillDomain, SkillDomainsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    createdCallback?: (skill_domain: SkillDomain) => void;
}

export default function SkillDomainCreateButton(props: Props): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="skill_domain.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: { value: string };
                    code: { value: string };
                };
                return SkillDomainsService.postSkillDomainsResource({
                    name: typed_form.name.value,
                    code: typed_form.code.value,
                });
            }}
            onResponse={({ skill_domain }) => createdCallback?.(skill_domain)}
        >
            <Form.Group controlId="name">
                <Form.Label>{t('skill_domain.add_edit.name.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('skill_domain.add_edit.name.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('skill_domain.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="code">
                <Form.Label>{t('skill_domain.add_edit.code.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('skill_domain.add_edit.code.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('skill_domain.add_edit.code.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
