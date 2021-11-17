import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Belt, BeltList, BeltsService } from './api';
import './index.css';

interface CreateBeltButtonProps
{
    createdCallback?: (belt: Belt) => void;
}

export function CreateBeltButton(props : CreateBeltButtonProps): ReactElement {
    const { createdCallback } = props;
    const [show, setShow] = useState(false);
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
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Belt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: White Belt" />
                        <Form.Text className="text-muted">
                            Name for the new belt
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Creating</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Add</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface MoveBeltButtonProps {
    buttonContent: string;
    direction_name: string;
    direction: number;
    belt: Belt;
    belts: Belt[];
    setBeltList: (beltList: BeltList) => void;
}

export function MoveBeltButton(props : MoveBeltButtonProps): ReactElement {
    const { buttonContent, direction_name, direction, belt, belts, setBeltList } = props;
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
            setBeltList({ belts: belts });
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Move {direction_name}</Tooltip>}>
            {moving
                ? <Button disabled>
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Moving {direction_name}</span>
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
    const [show, setShow] = useState(false);
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
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit Belt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: Algebra" defaultValue={belt.name} />
                        <Form.Text className="text-muted">
                            New name for the belt “{belt.name}”
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="color">
                        <Form.Label>Color</Form.Label>
                        <Form.Control type="color" defaultValue={belt.color} title="Choose your color" />
                        <Form.Text className="text-muted">
                            New color for the belt “{belt.name}”
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Saving</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Save</Button>
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
    const [show, setShow] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        BeltsService.deleteBeltResource(belt.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Belt</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the belt “{belt.name}”?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">Deleting</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>Delete</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}
