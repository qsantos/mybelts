
import React from 'react';
import { FormEvent, ReactElement, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getAPIError } from './lib';
import type { CancelablePromise } from './api/core/CancelablePromise';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';

interface ModalButtonProps<T> {
    variant?: string;
    i18nPrefix: string,
    onSubmit: (form: EventTarget) => CancelablePromise<T>,
    onResponse: (json: T) => void,
    children: ReactNode | ReactNode[];
}

export function ModalButton<T>(props: ModalButtonProps<T>): ReactElement {
    const { variant, i18nPrefix, onSubmit, onResponse, children } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [in_process, setIn_process] = useState(false);

    const handleSubmit = (event: FormEvent) => {
        setIn_process(true);
        event.preventDefault();
        onSubmit(event.target)
            .then(json => {
                setShow(false);
                setIn_process(false);
                onResponse(json);
            })
            .catch(error => {
                setIn_process(false);
                setErrorMessage(getAPIError(error));
            });
    };

    return <>
        <OverlayTrigger overlay={<Tooltip>{t(i18nPrefix + '.button.tooltip')}</Tooltip>}>
            <Button variant={variant || 'primary'} onClick={() => setShow(true)} dangerouslySetInnerHTML={{
                __html: t(i18nPrefix + '.button'),
            }}></Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t(i18nPrefix + '.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    {children}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t(i18nPrefix + '.cancel')}</Button>
                    {in_process
                        ? <Button type="submit" variant={variant || 'primary'} disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t(i18nPrefix + '.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit" variant={variant || 'primary'}>{t(i18nPrefix + '.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}
