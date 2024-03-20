import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Level, SchoolClass, SchoolClassesService } from './api';
import ModalButton from './ModalButton';

interface Props {
    level: Level;
    createdCallback?: (school_class: SchoolClass) => void;
}

export default function SchoolClassCreateButton(props: Props): ReactElement {
    const { level, createdCallback } = props;
    const { t } = useTranslation();

    return (
        <>
            <ModalButton
                i18nPrefix="school_class.add"
                i18nArgs={{ level }}
                onSubmit={(form: EventTarget) => {
                    const typed_form = form as typeof form & {
                        suffix: { value: string };
                    };
                    return SchoolClassesService.postSchoolClassesResource({
                        level_id: level.id,
                        suffix: typed_form.suffix.value,
                    });
                }}
                onResponse={({ school_class }) =>
                    createdCallback?.(school_class)
                }
            >
                <Form.Group controlId="suffix">
                    <Form.Label>
                        {t('school_class.add_edit.suffix.title')}
                    </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder={t(
                            'school_class.add_edit.suffix.placeholder'
                        )}
                    />
                    <Form.Text className="text-muted">
                        {t('school_class.add_edit.suffix.help')}
                    </Form.Text>
                </Form.Group>
            </ModalButton>
        </>
    );
}
