import React from 'react';
import { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';

import { SchoolClass, SchoolClassesService } from './api';
import { getAPIError } from './lib';

interface Props {
    school_class: SchoolClass;
    setErrorMessage: Dispatch<SetStateAction<string>>;
}

export default function SchoolClassExamsPDFButton(props: Props): ReactElement {
    const { school_class, setErrorMessage } = props;

    const { t } = useTranslation();
    const [in_process, setIn_process] = useState(false);

    function downloadExamsPDF() {
        setIn_process(true);
        return SchoolClassesService.getSchoolClassExamPdfResource(
            school_class.id
        )
            .then((blob: Blob) => {
                const url = URL.createObjectURL(blob);
                try {
                    const link = document.createElement(
                        'A'
                    ) as HTMLAnchorElement;
                    link.href = url;
                    link.download = 'exam.pdf';
                    link.click();
                } finally {
                    URL.revokeObjectURL(url);
                }
                setIn_process(false);
            })
            .catch((error) => {
                setIn_process(false);
                setErrorMessage(getAPIError(error));
            });
    }

    if (in_process) {
        return (
            <Button disabled>
                <Spinner animation="border" role="status" size="sm">
                    <span className="visually-hidden"></span>
                </Spinner>
            </Button>
        );
    } else {
        return (
            <OverlayTrigger
                overlay={<Tooltip>{t('waitlist.exam_pdf.button')}</Tooltip>}
            >
                <Button onClick={downloadExamsPDF}>
                    <img
                        src="/pdf.svg"
                        height="20"
                        alt={t('waitlist.exam_pdf.image.alt')}
                    />
                </Button>
            </OverlayTrigger>
        );
    }
}
