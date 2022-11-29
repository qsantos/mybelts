import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { ClassLevel, SchoolClass, Student, StudentsService } from './api';
import { ModalButton } from './ModalButton';

interface Props {
    school_class: SchoolClass;
    class_level: ClassLevel;
    createdCallback?: (student: Student) => void;
}

export function StudentCreateButton(props: Props): ReactElement {
    const { school_class, class_level, createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="student.add"
            i18nArgs={{ class_level, school_class }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    display_name: { value: string };
                    username: { value: string };
                    password: { value: string };
                    can_register_to_waitlist: { checked: boolean };
                };
                return StudentsService.postStudentsResource({
                    school_class_id: school_class.id,
                    display_name: typed_form.display_name.value,
                    username: typed_form.username.value,
                    password: typed_form.password.value,
                    can_register_to_waitlist:
                        typed_form.can_register_to_waitlist.checked,
                });
            }}
            onResponse={({ student }) => createdCallback?.(student)}
        >
            <Form.Group controlId="display_name">
                <Form.Label>
                    {t('student.add_edit.display_name.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('student.add_edit.display_name.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('student.add_edit.display_name.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="can_register_to_waitlist">
                <Form.Check
                    label={t('student.add_edit.can_register_to_waitlist.title')}
                />
                <Form.Text className="text-muted">
                    {t('student.add_edit.can_register_to_waitlist.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="username">
                <Form.Label>{t('student.add_edit.username.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('student.add_edit.username.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('student.add_edit.username.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>{t('student.add_edit.password.title')}</Form.Label>
                <Form.Control type="password" />
                <Form.Text className="text-muted">
                    {t('student.add_edit.password.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
