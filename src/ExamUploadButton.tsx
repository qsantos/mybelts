import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';

import {
    Belt,
    ClassLevel,
    Exam,
    SkillDomain,
    ClassLevelsService,
    ExamOne,
} from './api';
import ModalButton from './ModalButton';

interface Props {
    belt: Belt;
    skill_domain: SkillDomain;
    class_level: ClassLevel;
    createdCallback: (new_exam: Exam) => void;
}

export default function ExamUploadButton(props: Props): ReactElement {
    const { belt, skill_domain, class_level, createdCallback } = props;
    const { t } = useTranslation();
    return (
        <ModalButton
            i18nPrefix="exam.upload"
            i18nArgs={{ belt, skill_domain, class_level }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    code: { value: string };
                    file: HTMLInputElement;
                };
                return new Promise<ExamOne>((resolve, reject) => {
                    const file = typed_form.file.files?.[0];
                    if (!file) {
                        return;
                    }
                    file.arrayBuffer()
                        .then((data) =>
                            ClassLevelsService.postClassLevelExamsResource(
                                class_level.id,
                                skill_domain.id,
                                belt.id,
                                typed_form.code.value,
                                file.name,
                                new Blob([data])
                            )
                                .then(resolve)
                                .catch(reject)
                        )
                        .catch(reject);
                });
            }}
            onResponse={({ exam }) => createdCallback(exam)}
        >
            <Form.Group controlId="code">
                <Form.Label>{t('exam.add_edit.code.title')}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={t('exam.add_edit.code.placeholder')}
                />
                <Form.Text className="text-muted">
                    {t('exam.add_edit.code.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="file">
                <Form.Label>{t('exam.upload.file.title')}</Form.Label>
                <Form.Control type="file" />
                <Form.Text className="text-muted">
                    {t('exam.upload.file.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}
