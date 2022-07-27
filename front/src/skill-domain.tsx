import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

import { SkillDomain, SkillDomainsService } from './api';

interface CreateSkillDomainButtonProps
{
    createdCallback?: (skill_domain: SkillDomain) => void;
}

export function CreateSkillDomainButton(props : CreateSkillDomainButtonProps): ReactElement {
    const { createdCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        SkillDomainsService.postSkillDomainsResource({
            name: target.name.value,
        }).then(({ skill_domain }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(skill_domain);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Skill Domain</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: Algebra" />
                        <Form.Text className="text-muted">
                            Name for the new skill domain
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

interface EditSkillDomainButtonProps
{
    skill_domain: SkillDomain;
    changedCallback?: (changed_skill_domain: SkillDomain) => void;
}

export function EditSkillDomainButton(props : EditSkillDomainButtonProps): ReactElement {
    const { skill_domain, changedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        SkillDomainsService.putSkillDomainResource(skill_domain.id, {
            name: target.name.value,
        }).then(({ skill_domain: changed_skill_domain }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_skill_domain);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit Skill Domain</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: Algebra" defaultValue={skill_domain.name} />
                        <Form.Text className="text-muted">
                            New name for the skill domain “{skill_domain.name}”
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

interface DeleteSkillDomainButtonProps
{
    skill_domain: SkillDomain;
    deletedCallback?: () => void;
}

export function DeleteSkillDomainButton(props : DeleteSkillDomainButtonProps): ReactElement {
    const { skill_domain, deletedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        SkillDomainsService.deleteSkillDomainResource(skill_domain.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        }).catch(error => {
            setDeleting(false);
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Skill Domain</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                Are you sure you want to delete the skill domain “{skill_domain.name}”?
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

interface SkillDomainListingProps {
    skill_domains: SkillDomain[];
    setSkillDomains: (skill_domains: SkillDomain[]) => void;
}

export function SkillDomainListing(props: SkillDomainListingProps): ReactElement {
    const { skill_domains, setSkillDomains } = props;
    return <>
        <Table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {skill_domains.map((skill_domain, index) =>
                    <tr key={skill_domain.id}>
                        <td>{skill_domain.name}</td>
                        <td>
                            <EditSkillDomainButton skill_domain={skill_domain} changedCallback={new_skill_domain => {
                                skill_domains[index] = new_skill_domain;
                                setSkillDomains(skill_domains);
                            }} />
                            {' '}
                            <DeleteSkillDomainButton skill_domain={skill_domain} deletedCallback={() => {
                                skill_domains.splice(index, 1);
                                setSkillDomains(skill_domains);
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}
