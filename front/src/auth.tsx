import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import { LoginInfo, UsersService } from './api';

interface LoginButtonProps {
    className?: string;
    loggedInCallback: (loginInfo: LoginInfo) => void;
}

export function LoginButton(props: LoginButtonProps): ReactElement {
    const { className, loggedInCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);

    const nameInputRef = React.useRef<HTMLInputElement>(null);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setLoggingIn(true);
        const target = event.target as typeof event.target & {
            name: {value: string};
            password: {value: string};
        };
        UsersService.postLoginResource({
            name: target.name.value,
            password: target.password.value,
        }).then((loginInfo) => {
            setLoggingIn(false);
            loggedInCallback(loginInfo);
        }).catch(error => {
            setLoggingIn(false);
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <Modal show={show} onShow={() => nameInputRef.current?.focus?.()}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Log In</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>User Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: tartempion" ref={nameInputRef} />
                        <Form.Text className="text-muted">
                            Your user name
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" />
                        <Form.Text className="text-muted">
                            Your password
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {loggingIn
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Logging in</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Log in</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
        <Button onClick={() => setShow(true)} className={className} >Log in</Button>
    </>;
}

interface LogoutButtonProps {
    className?: string;
    loggedOutCallback: () => void;
}

export function LogoutButton(props: LogoutButtonProps): ReactElement {
    const { className, loggedOutCallback } = props;

    return <>
        <Button onClick={() => loggedOutCallback()} className={className} >Log out</Button>
    </>;
}
