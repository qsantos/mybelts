import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Belt, BeltsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    createdCallback?: (belt: Belt) => void;
}

export default function BeltCreateButton(props: Props): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="belt.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: { value: string };
                    code: { value: string };
                    color: { value: string };
                };
                return BeltsService.postBeltsResource({
                    name: typed_form.name.value,
                    code: typed_form.code.value,
                    color: typed_form.color.value,
                });
            }}
            onResponse={({ belt }) => createdCallback?.(belt)}
        >
            <Form.Group controlId="name">
                <Form.Label>{t('belt.add_edit.name.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('belt.add_edit.name.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('belt.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="code">
                <Form.Label>{t('belt.add_edit.code.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('belt.add_edit.code.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('belt.add_edit.code.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="color">
                <Form.Label>{t('belt.add_edit.color.title')}</Form.Label>
                <Form.Control
                    type="color"
                    title="{t('belt.add_edit.color.placeholder')}"
                />
                <Form.Text className="text-muted">
                    {t('belt.add_edit.color.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
