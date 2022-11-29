import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { ClassLevel, ClassLevelsService } from './api';
import { ModalButton } from './ModalButton';

interface Props {
    class_level: ClassLevel;
    changedCallback?: (changed_class_level: ClassLevel) => void;
}

export function ClassLevelEditButton(props: Props): ReactElement {
    const { class_level, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="class_level.edit"
            i18nArgs={{ class_level }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    prefix: { value: string };
                };
                return ClassLevelsService.putClassLevelResource(
                    class_level.id,
                    {
                        prefix: typed_form.prefix.value,
                    }
                );
            }}
            onResponse={({ class_level: changed_class_level }) =>
                changedCallback?.(changed_class_level)
            }
        >
            <Form.Group controlId="prefix">
                <Form.Label>
                    {t('class_level.add_edit.prefix.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('class_level.add_edit.prefix.placeholder')}
                    defaultValue={class_level.prefix}
                />
                <Form.Text className="text-muted">
                    {t('class_level.add_edit.prefix.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
