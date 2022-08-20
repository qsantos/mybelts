import React from 'react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

import { Belt, BeltsService } from './api';
import { AdminOnly } from './auth';
import { ReactComponent as BeltImage } from './belt.svg';
import { getAPIError } from './lib';
import { ModalButton } from './modal-button';

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

interface CreateBeltButtonProps {
    createdCallback?: (belt: Belt) => void;
}

export function CreateBeltButton(props : CreateBeltButtonProps): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="belt.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: {value: string};
                };
                return BeltsService.postBeltsResource({
                    name: typed_form.name.value,
                });
            }}
            onResponse={({ belt }) => createdCallback?.(belt)}
        >
            <Form.Group controlId="name">
                <Form.Label>{t('belt.add_edit.name.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('belt.add_edit.name.placeholder')}/>
                <Form.Text className="text-muted">
                    {t('belt.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
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

interface EditBeltButtonProps {
    belt: Belt;
    changedCallback?: (changed_belt: Belt) => void;
}

export function EditBeltButton(props : EditBeltButtonProps): ReactElement {
    const { belt, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="belt.edit"
            i18nArgs={{ belt }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: {value: string};
                    color: {value: string};
                };
                return BeltsService.putBeltResource(belt.id, {
                    name: typed_form.name.value,
                    color: typed_form.color.value,
                });
            }}
            onResponse={({ belt: changed_belt }) => changedCallback?.(changed_belt)}
        >
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
        </ModalButton>
    );
}

interface DeleteBeltButtonProps {
    belt: Belt;
    deletedCallback?: () => void;
}

export function DeleteBeltButton(props : DeleteBeltButtonProps): ReactElement {
    const { belt, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="belt.delete"
            i18nArgs={{ belt }}
            onSubmit={() => BeltsService.deleteBeltResource(belt.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('belt.delete.message', { belt })}
        </ModalButton>
    );
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
