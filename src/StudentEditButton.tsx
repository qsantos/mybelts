import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import { Student, StudentsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    student: Student;
    changedCallback?: (changed_student: Student) => void;
}

export default function StudentEditButton(props: Props): ReactElement {
    const { student, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="student.edit"
            i18nArgs={{ student }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    display_name: { value: string };
                    username: { value: string };
                    password: { value: string };
                    rank: { value: string };
                    can_register_to_waitlist: { checked: boolean };
                };
                return StudentsService.putStudentResource(student.id, {
                    display_name: typed_form.display_name.value,
                    rank: parseInt(typed_form.rank.value),
                    username: typed_form.username.value,
                    password: typed_form.password.value,
                    can_register_to_waitlist:
                        typed_form.can_register_to_waitlist.checked,
                });
            }}
            onResponse={({ student: changed_student }) =>
                changedCallback?.(changed_student)
            }
        >
            <Form.Group controlId="display_name">
                <Form.Label>
                    {t('student.add_edit.display_name.title')}
                </Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('student.add_edit.display_name.placeholder')}
                    defaultValue={student.display_name}
                />
                <Form.Text className="text-muted">
                    {t('student.add_edit.display_name.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="can_register_to_waitlist">
                <Form.Check
                    label={t('student.add_edit.can_register_to_waitlist.title')}
                    defaultChecked={student.can_register_to_waitlist}
                />
                <Form.Text className="text-muted">
                    {t('student.add_edit.can_register_to_waitlist.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="rank">
                <Form.Label>{t('student.add_edit.rank.title')}</Form.Label>
                <Form.Control
                    type="number"
                    placeholder={t('student.add_edit.rank.placeholder')}
                    defaultValue={student.rank}
                />
                <Form.Text className="text-muted">
                    {t('student.add_edit.rank.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="username">
                <Form.Label>{t('student.add_edit.username.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('student.add_edit.username.placeholder')}
                    defaultValue={student.username}
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
