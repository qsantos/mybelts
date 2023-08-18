import React from 'react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { Belt, Exam, SkillDomain, ExamsService } from './api';
import { getAPIError } from './lib';
import ModalButton from './ModalButton';
import { ModalButtonButton, ModalButtonModal } from './ModalButton';

function download_exam(exam: Exam): Promise<void> {
    return ExamsService.getExamsResource(exam.id).then((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        try {
            const link = document.createElement('A') as HTMLAnchorElement;
            link.href = url;
            link.download = exam.filename;
            link.click();
        } finally {
            URL.revokeObjectURL(url);
        }
    });
}

interface Option {
    value: number;
    label: string;
}

interface Props {
    exam: Exam;
    belt: Belt;
    skill_domain: SkillDomain;
    belt_options: Option[];
    skill_domain_options: Option[];
    changedCallback?: (changed_exam: Exam) => void;
    deletedCallback?: (exam_id: number) => void;
}

function ExamEditButton_(props: Props): ReactElement {
    const {
        exam,
        belt,
        skill_domain,
        belt_options,
        skill_domain_options,
        changedCallback,
        deletedCallback,
    } = props;
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [showDelete, setShowDelete] = useState(false);
    const deleteModalButtonProps = {
        variant: 'danger',
        i18nPrefix: 'exam.delete',
        i18nArgs: { exam },
        onSubmit: () => ExamsService.deleteExamsResource(exam.id),
        onResponse: () => deletedCallback?.(exam.id),
        show: showDelete,
        setShow: setShowDelete,
    };
    return (
        <>
            <ModalButtonModal {...deleteModalButtonProps}>
                {t('exam.delete.message')}
            </ModalButtonModal>
            <ModalButton
                i18nPrefix="exam.add_edit"
                i18nArgs={{ exam }}
                onSubmit={(form: EventTarget) => {
                    const typed_form = form as typeof form & {
                        code: { value: string };
                        filename: { value: string };
                        belt: { value: string };
                        skill_domain: { value: string };
                    };
                    return ExamsService.putExamsResource(exam.id, {
                        code: typed_form.code.value,
                        filename: typed_form.filename.value,
                        skill_domain_id: parseInt(
                            typed_form.skill_domain.value
                        ),
                        belt_id: parseInt(typed_form.belt.value),
                    });
                }}
                onResponse={({ exam: changed_exam }) =>
                    changedCallback?.(changed_exam)
                }
            >
                {errorMessage && (
                    <Alert variant="danger">
                        {t('error')}: {errorMessage}
                    </Alert>
                )}
                <Button
                    onClick={() => {
                        setErrorMessage('');
                        download_exam(exam).catch((error) => {
                            setErrorMessage(getAPIError(error));
                        });
                    }}
                >
                    {t('exam.add_edit.open')}
                </Button>
                <ModalButtonButton {...deleteModalButtonProps} />
                <Form.Group controlId="code">
                    <Form.Label>{t('exam.add_edit.code.title')}</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder={t('exam.add_edit.code.placeholder')}
                        defaultValue={exam.code}
                    />
                    <Form.Text className="text-muted">
                        {t('exam.add_edit.code.help')}
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="filename">
                    <Form.Label>{t('exam.add_edit.filename.title')}</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder={t('exam.add_edit.filename.placeholder')}
                        defaultValue={exam.filename}
                    />
                    <Form.Text className="text-muted">
                        {t('exam.add_edit.filename.help')}
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="skill_domain">
                    <Form.Label>
                        {t('exam.add_edit.skill_domain.title')}
                    </Form.Label>
                    <Select
                        id="skill_domain"
                        name="skill_domain"
                        options={skill_domain_options}
                        defaultValue={{
                            value: skill_domain.id,
                            label: skill_domain.name,
                        }}
                    />
                    <Form.Text className="text-muted">
                        {t('exam.add_edit.skill_domain.help')}
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="belt">
                    <Form.Label>{t('exam.add_edit.belt.title')}</Form.Label>
                    <Select
                        id="belt"
                        name="belt"
                        options={belt_options}
                        defaultValue={{
                            value: belt.id,
                            label: belt.name,
                        }}
                    />
                    <Form.Text className="text-muted">
                        {t('exam.add_edit.belt.help')}
                    </Form.Text>
                </Form.Group>
            </ModalButton>
        </>
    );
}

const ExamEditButton = React.memo(ExamEditButton_);

export default ExamEditButton;
