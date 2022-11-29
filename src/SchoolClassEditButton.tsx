import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { ClassLevel, SchoolClass, SchoolClassesService } from './api';
import ModalButton from './ModalButton';

interface Props {
    class_level: ClassLevel;
    school_class: SchoolClass;
    changedCallback?: (changed_school_class: SchoolClass) => void;
}

export default function SchoolClassEditButton(props: Props): ReactElement {
    const { class_level, school_class, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="school_class.edit"
            i18nArgs={{ class_level, school_class }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    suffix: { value: string };
                };
                return SchoolClassesService.putSchoolClassResource(
                    school_class.id,
                    {
                        suffix: typed_form.suffix.value,
                    }
                );
            }}
            onResponse={({ school_class: changed_school_class }) =>
                changedCallback?.(changed_school_class)
            }
        >
            <Form.Group controlId="suffix">
                <Form.Label>
                    {t('school_class.add_edit.suffix.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('school_class.add_edit.suffix.placeholder')}
                    defaultValue={school_class.suffix}
                />
                <Form.Text className="text-muted">
                    {t('school_class.add_edit.suffix.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
