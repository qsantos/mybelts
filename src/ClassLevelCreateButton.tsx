import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { ClassLevel, ClassLevelsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    createdCallback?: (class_level: ClassLevel) => void;
}

export default function ClassLevelCreateButton(props: Props): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="class_level.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    prefix: { value: string };
                };
                return ClassLevelsService.postClassLevelsResource({
                    prefix: typed_form.prefix.value,
                });
            }}
            onResponse={({ class_level }) => createdCallback?.(class_level)}
        >
            <Form.Group controlId="prefix">
                <Form.Label>
                    {t('class_level.add_edit.prefix.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('class_level.add_edit.prefix.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('class_level.add_edit.prefix.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
