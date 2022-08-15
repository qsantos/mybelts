import React from 'react';
import { FormEvent, ReactElement, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import { LoginInfo, DefaultService } from './api';
import { getAPIError } from './lib';

export const LoginContext = React.createContext<LoginInfo | null>(null);

export function is_admin(): boolean {
    const loginInfo = React.useContext(LoginContext);
    return loginInfo !== null && loginInfo.user.is_admin;
}

interface AdminOnlyProps {
    children: ReactNode | ReactNode[];
}

export function AdminOnly(props: AdminOnlyProps): (ReactElement | null) {
    const loginInfo = React.useContext(LoginContext);
    if (loginInfo !== null && loginInfo.user.is_admin) {
        return <>{props.children}</>;
    } else {
        return null;
    }
}

interface LoginButtonProps {
    className?: string;
    loggedInCallback: (loginInfo: LoginInfo) => void;
}

export function LoginButton(props: LoginButtonProps): ReactElement {
    const { className, loggedInCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    const nameInputRef = React.useRef<HTMLInputElement>(null);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setLoggingIn(true);
        const target = event.target as typeof event.target & {
            username: {value: string};
            password: {value: string};
        };
        DefaultService.postLoginResource({
            username: target.username.value,
            password: target.password.value,
        }).then((loginInfo) => {
            setLoggingIn(false);
            loggedInCallback(loginInfo);
        }).catch(error => {
            setLoggingIn(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <Modal show={show} onShow={() => nameInputRef.current?.focus?.()}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('login.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="username">
                        <Form.Label>{t('login.username.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('login.username.placeholder')} ref={nameInputRef} />
                        <Form.Text className="text-muted">
                            {t('login.username.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>{t('login.password.title')}</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            {t('login.password.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('login.cancel')}</Button>
                    {loggingIn
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('login.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('login.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
        <Button onClick={() => setShow(true)} className={className} >{t('login.button')}</Button>
    </>;
}

interface LogoutButtonProps {
    className?: string;
    loggedOutCallback: () => void;
}

export function LogoutButton(props: LogoutButtonProps): ReactElement {
    const { className, loggedOutCallback } = props;
    const { t } = useTranslation();

    return <>
        <Button onClick={() => loggedOutCallback()} className={className} >{t('logout.button')}</Button>
    </>;
}
