
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
    variant?: string,
    size?: 'sm' | 'lg' | 'xl',
    i18nPrefix: string,
    i18nArgs?: Record<string, unknown>,
    onSubmit: (form: EventTarget) => CancelablePromise<T>,
    onResponse: (json: T) => void,
    children: ReactNode | ReactNode[],
}

export function ModalButton<T>(props: ModalButtonProps<T>): ReactElement {
    const { variant, size, i18nPrefix, i18nArgs, onSubmit, onResponse, children } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [in_process, setIn_process] = useState(false);

    const formRef = React.useRef<HTMLFormElement>(null);
    React.useEffect(() => formRef.current?.querySelector('input')?.focus(), [show]);

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
        <OverlayTrigger overlay={<Tooltip>{t(i18nPrefix + '.button.tooltip', i18nArgs)}</Tooltip>}>
            <Button variant={variant || 'primary'} onClick={() => setShow(true)} dangerouslySetInnerHTML={{
                __html: t(i18nPrefix + '.button', i18nArgs),
            }}></Button>
        </OverlayTrigger>
        <Modal size={size} show={show} onHide={() => setShow(false)}>
            <Form onSubmit={handleSubmit} ref={formRef}>
                <Modal.Header>
                    <Modal.Title>{t(i18nPrefix + '.title', i18nArgs)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    {children}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t(i18nPrefix + '.cancel', i18nArgs)}</Button>
                    {in_process
                        ? <Button type="submit" variant={variant || 'primary'} disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t(i18nPrefix + '.in_process', i18nArgs)}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit" variant={variant || 'primary'}>
                            {t(i18nPrefix + '.confirm', i18nArgs)}
                        </Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}
