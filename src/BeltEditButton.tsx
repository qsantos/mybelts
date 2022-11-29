import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Belt, BeltsService } from './api';
import { ModalButton } from './ModalButton';

interface Props {
    belt: Belt;
    changedCallback?: (changed_belt: Belt) => void;
}

export function BeltEditButton(props: Props): ReactElement {
    const { belt, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="belt.edit"
            i18nArgs={{ belt }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: { value: string };
                    color: { value: string };
                    code: { value: string };
                };
                return BeltsService.putBeltResource(belt.id, {
                    name: typed_form.name.value,
                    color: typed_form.color.value,
                    code: typed_form.code.value,
                });
            }}
            onResponse={({ belt: changed_belt }) =>
                changedCallback?.(changed_belt)
            }
        >
            <Form.Group controlId="name">
                <Form.Label>{t('belt.add_edit.name.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('belt.add_edit.name.placeholder')}
                    defaultValue={belt.name}
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
                    defaultValue={belt.code}
                />
                <Form.Text className="text-muted">
                    {t('belt.add_edit.code.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="color">
                <Form.Label>{t('belt.add_edit.color.title')}</Form.Label>
                <Form.Control
                    type="color"
                    defaultValue={belt.color}
                    title="{t('belt.add_edit.color.placeholder')}"
                />
                <Form.Text className="text-muted">
                    {t('belt.add_edit.color.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
