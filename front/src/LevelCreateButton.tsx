import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Level, LevelsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    createdCallback?: (level: Level) => void;
}

export default function LevelCreateButton(props: Props): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="level.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: { value: string };
                };
                return LevelsService.postLevelsResource({
                    name: typed_form.name.value,
                });
            }}
            onResponse={({ level }) => createdCallback?.(level)}
        >
            <Form.Group controlId="name">
                <Form.Label>
                    {t('level.add_edit.name.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('level.add_edit.name.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('level.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
