import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

import { ClassLevel, ClassLevelsService } from './api';
import { AdminOnly } from './auth';
import { getAPIError } from './lib';

interface CreateClassLevelButtonProps
{
    createdCallback?: (class_level: ClassLevel) => void;
}

export function CreateClassLevelButton(props : CreateClassLevelButtonProps): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            prefix: {value: string};
        };
        ClassLevelsService.postClassLevelsResource({
            prefix: target.prefix.value,
        }).then(({ class_level }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(class_level);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>{t('class_level.add.button')}</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('class_level.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="prefix">
                        <Form.Label>{t('class_level.add_edit.prefix.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('class_level.add_edit.prefix.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('class_level.add_edit.prefix.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('class_level.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('class_level.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('class_level.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface EditClassLevelButtonProps
{
    class_level: ClassLevel;
    changedCallback?: (changed_class_level: ClassLevel) => void;
}

export function EditClassLevelButton(props : EditClassLevelButtonProps): ReactElement {
    const { class_level, changedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            prefix: {value: string};
        };
        ClassLevelsService.putClassLevelResource(class_level.id, {
            prefix: target.prefix.value,
        }).then(({ class_level: changed_class_level }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_class_level);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('class_level.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('class_level.edit.title')}: {class_level.prefix}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="prefix">
                        <Form.Label>{t('class_level.add_edit.prefix.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('class_level.add_edit.prefix.placeholder')} defaultValue={class_level.prefix} />
                        <Form.Text className="text-muted">
                            {t('class_level.add_edit.prefix.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('class_level.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('class_level.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('class_level.edit.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteClassLevelButtonProps
{
    class_level: ClassLevel;
    deletedCallback?: () => void;
}

export function DeleteClassLevelButton(props : DeleteClassLevelButtonProps): ReactElement {
    const { class_level, deletedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        ClassLevelsService.deleteClassLevelResource(class_level.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        }).catch(error => {
            setDeleting(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('class_level.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('class_level.delete.title')}: {class_level.prefix}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                {t('class_level.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('class_level.delete.cancel')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('class_level.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('class_level.delete.confirm')}</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface ClassLevelListingProps {
    class_levels: ClassLevel[];
    setClassLevels: (class_levels: ClassLevel[]) => void;
}

export function ClassLevelListing(props: ClassLevelListingProps): ReactElement {
    const { class_levels, setClassLevels } = props;
    const { t } = useTranslation();
    return <>
        <Table>
            <thead>
                <tr>
                    <th>{t('class_level.list.prefix.title')}</th>
                    <AdminOnly>
                        <th>{t('class_level.list.actions.title')}</th>
                    </AdminOnly>
                </tr>
            </thead>
            <tbody>
                {class_levels.map((class_level, index) =>
                    <tr key={class_level.id}>
                        <td>
                            <Nav.Link as={Link} to={'/class-levels/' + class_level.id}>
                                {class_level.prefix}
                            </Nav.Link>
                        </td>
                        <AdminOnly>
                            <td>
                                <EditClassLevelButton class_level={class_level} changedCallback={new_class_level => {
                                    const new_class_levels = [...class_levels];
                                    new_class_levels[index] = new_class_level;
                                    setClassLevels(new_class_levels);
                                }} />
                                {' '}
                                <DeleteClassLevelButton class_level={class_level} deletedCallback={() => {
                                    const new_class_levels = [...class_levels];
                                    new_class_levels.splice(index, 1);
                                    setClassLevels(new_class_levels);
                                }} />
                            </td>
                        </AdminOnly>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}
