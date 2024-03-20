import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Level, Class, ClassesService } from './api';
import ModalButton from './ModalButton';

interface Props {
    level: Level;
    createdCallback?: (class_: Class) => void;
}

export default function ClassCreateButton(props: Props): ReactElement {
    const { level, createdCallback } = props;
    const { t } = useTranslation();

    return (
        <>
            <ModalButton
                i18nPrefix="class.add"
                i18nArgs={{ level }}
                onSubmit={(form: EventTarget) => {
                    const typed_form = form as typeof form & {
                        suffix: { value: string };
                    };
                    return ClassesService.postClassesResource({
                        level_id: level.id,
                        suffix: typed_form.suffix.value,
                    });
                }}
                onResponse={({ class: class_ }) =>
                    createdCallback?.(class_)
                }
            >
                <Form.Group controlId="suffix">
                    <Form.Label>
                        {t('class.add_edit.suffix.title')}
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder={t(
                            'class.add_edit.suffix.placeholder'
                        )}
                    />
                    <Form.Text className="text-muted">
                        {t('class.add_edit.suffix.help')}
                    </Form.Text>
                </Form.Group>
            </ModalButton>
        </>
    );
}
