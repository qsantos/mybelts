import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Level, LevelsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    level: Level;
    changedCallback?: (changed_level: Level) => void;
}

export default function LevelEditButton(props: Props): ReactElement {
    const { level, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="level.edit"
            i18nArgs={{ level }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: { value: string };
                };
                return LevelsService.putLevelResource(
                    level.id,
                    {
                        name: typed_form.name.value,
                    }
                );
            }}
            onResponse={({ level: changed_level }) =>
                changedCallback?.(changed_level)
            }
        >
            <Form.Group controlId="name">
                <Form.Label>
                    {t('level.add_edit.name.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('level.add_edit.name.placeholder')}
                    defaultValue={level.name}
                />
                <Form.Text className="text-muted">
                    {t('level.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
