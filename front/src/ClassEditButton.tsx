import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Level, Class, ClassesService } from './api';
import ModalButton from './ModalButton';

interface Props {
    level: Level;
    class: Class;
    changedCallback?: (changed_class: Class) => void;
}

export default function ClassEditButton(props: Props): ReactElement {
    const { level, class: class_, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="class.edit"
            i18nArgs={{ level, class: class_ }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: { value: string };
                };
                return ClassesService.putClassResource(
                    class_.id,
                    {
                        name: typed_form.name.value,
                    }
                );
            }}
            onResponse={({ class: changed_class }) =>
                changedCallback?.(changed_class)
            }
        >
            <Form.Group controlId="name">
                <Form.Label>
                    {t('class.add_edit.name.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('class.add_edit.name.placeholder')}
                    defaultValue={class_.name}
                />
                <Form.Text className="text-muted">
                    {t('class.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
