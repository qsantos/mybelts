import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

import { Belt, BeltsService } from './api';
import { AdminOnly } from './auth';
import { ReactComponent as BeltImage } from './belt.svg';
import { getAPIError } from './lib';

interface BeltIconProps {
    belt: Belt;
    height?: number;
}

export function BeltIcon(props: BeltIconProps): ReactElement {
    const { belt, height } = props;
    return <>
        <OverlayTrigger overlay={<Tooltip>{belt.name}</Tooltip>}>
            <BeltImage height={height || 40} fill={belt.color} />
        </OverlayTrigger>
    </>;
}

interface CreateBeltButtonProps
{
    createdCallback?: (belt: Belt) => void;
}

export function CreateBeltButton(props : CreateBeltButtonProps): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        BeltsService.postBeltsResource({
            name: target.name.value,
        }).then(({ belt }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(belt);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>{t('belt.add.button')}</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('belt.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('belt.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('belt.add_edit.name.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('belt.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('belt.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('belt.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('belt.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface MoveBeltButtonProps {
    buttonContent: string;
    direction_key: string;
    direction: number;
    belt: Belt;
    belts: Belt[];
    setBelts: (belts: Belt[]) => void;
    setErrorMessage: (errorMessage: string) => void;
}

export function MoveBeltButton(props : MoveBeltButtonProps): ReactElement {
    const { buttonContent, direction_key, direction, belt, belts, setBelts, setErrorMessage } = props;
    const { t } = useTranslation();
    const [moving, setMoving] = useState(false);

    function handleMove() {
        setMoving(true);
        BeltsService.patchBeltRankResource(belt.id, {
            increase_by: direction,
        }).then(() => {
            setMoving(false);
            const other_belt = belts[belt.rank + direction - 1];
            if (other_belt === undefined) {
                console.error('Failed to find other belt');
                return;
            }
            // adjust belt list
            [belt.rank, other_belt.rank] = [other_belt.rank, belt.rank];
            belts[belt.rank - 1] = belt;
            belts[other_belt.rank - 1] = other_belt;
            setBelts(belts);
        }).catch(error => {
            setMoving(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('belt.move.' + direction_key + '.title')}</Tooltip>}>
            {moving
                ? <Button disabled>
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">{t('belt.move.' + direction_key + '.title')}</span>
                    </Spinner>
                </Button>
                : <Button disabled={belt.rank + direction <= 0 || belt.rank + direction > belts.length} onClick={handleMove}>
                    {buttonContent}
                </Button>
            }
        </OverlayTrigger>
    </>;
}

interface EditBeltButtonProps
{
    belt: Belt;
    changedCallback?: (changed_belt: Belt) => void;
}

export function EditBeltButton(props : EditBeltButtonProps): ReactElement {
    const { belt, changedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
            color: {value: string};
        };
        BeltsService.putBeltResource(belt.id, {
            name: target.name.value,
            color: target.color.value,
        }).then(({ belt: changed_belt }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_belt);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('belt.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('belt.edit.title')}: {belt.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}l: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('belt.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('belt.add_edit.name.placeholder')} defaultValue={belt.name} />
                        <Form.Text className="text-muted">
                            {t('belt.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="color">
                        <Form.Label>{t('belt.add_edit.color.title')}</Form.Label>
                        <Form.Control type="color" defaultValue={belt.color} title="{t('belt.add_edit.color.help')}" />
                        <Form.Text className="text-muted">
                            {t('belt.add_edit.color.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('belt.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('belt.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('belt.edit.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteBeltButtonProps
{
    belt: Belt;
    deletedCallback?: () => void;
}

export function DeleteBeltButton(props : DeleteBeltButtonProps): ReactElement {
    const { belt, deletedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        BeltsService.deleteBeltResource(belt.id).then(() => {
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
        <OverlayTrigger overlay={<Tooltip>{t('belt.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('belt.delete.title')}: {belt.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                {t('belt.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('belt.delete.cancel')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('belt.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('belt.delete.confirm')}</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface BeltListingProps {
    belts: Belt[];
    setBelts: (belts: Belt[]) => void;
    setErrorMessage: (errorMessage: string) => void;
}

export function BeltListing(props: BeltListingProps): ReactElement {
    const { belts, setBelts, setErrorMessage } = props;
    const { t } = useTranslation();

    return <>
        <Table>
            <thead>
                <tr>
                    <th>{t('belt.list.rank.title')}</th>
                    <th>{t('belt.list.name.title')}</th>
                    <th>{t('belt.list.color.title')}</th>
                    <AdminOnly>
                        <th>{t('belt.list.actions.title')}</th>
                    </AdminOnly>
                </tr>
            </thead>
            <tbody>
                {belts.map((belt, index) =>
                    <tr key={belt.id}>
                        <td>{belt.rank}</td>
                        <td>{belt.name}</td>
                        <td><BeltIcon belt={belt} /></td>
                        <AdminOnly>
                            <td>
                                <MoveBeltButton buttonContent="↑" direction_key="up" direction={-1} belt={belt} belts={belts} setBelts={setBelts} setErrorMessage={setErrorMessage} />
                                {' '}
                                <MoveBeltButton buttonContent="↓" direction_key="down" direction={1} belt={belt} belts={belts} setBelts={setBelts} setErrorMessage={setErrorMessage} />
                                {' '}
                                <EditBeltButton belt={belt} changedCallback={new_belt => {
                                    const new_belts = [...belts];
                                    new_belts[index] = new_belt;
                                    setBelts(new_belts);
                                }} />
                                {' '}
                                <DeleteBeltButton belt={belt} deletedCallback={() => {
                                    const new_belts = [...belts];
                                    new_belts.splice(index, 1);
                                    for (let j = index; j < new_belts.length; j += 1) {
                                        const other_belt = new_belts[j];
                                        if (other_belt !== undefined) {  // always true
                                            other_belt.rank -= 1;
                                        }
                                    }
                                    setBelts(new_belts);
                                }} />
                            </td>
                        </AdminOnly>
                    </tr>)}
            </tbody>
        </Table>
    </>;
}
