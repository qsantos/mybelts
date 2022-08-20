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

import { SkillDomain, SkillDomainsService } from './api';
import { AdminOnly } from './auth';
import { getAPIError } from './lib';

interface CreateSkillDomainButtonProps {
    createdCallback?: (skill_domain: SkillDomain) => void;
}

export function CreateSkillDomainButton(props : CreateSkillDomainButtonProps): ReactElement {
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
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>{t('skill_domain.add.button')}</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('skill_domain.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('skill_domain.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('skill_domain.add_edit.name.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('skill_domain.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('skill_domain.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('skill_domain.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('skill_domain.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface EditSkillDomainButtonProps {
    skill_domain: SkillDomain;
    changedCallback?: (changed_skill_domain: SkillDomain) => void;
}

export function EditSkillDomainButton(props : EditSkillDomainButtonProps): ReactElement {
    const { skill_domain, changedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
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
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('skill_domain.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('skill_domain.edit.title')}: {skill_domain.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="name">
                        <Form.Label>{t('skill_domain.add_edit.name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('skill_domain.add_edit.name.placeholder')} defaultValue={skill_domain.name} />
                        <Form.Text className="text-muted">
                            {t('skill_domain.add_edit.name.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('skill_domain.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('skill_domain.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('skill_domain.edit.cancel')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteSkillDomainButtonProps {
    skill_domain: SkillDomain;
    deletedCallback?: () => void;
}

export function DeleteSkillDomainButton(props : DeleteSkillDomainButtonProps): ReactElement {
    const { skill_domain, deletedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
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
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('skill_domain.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('skill_domain.delete.title')}: {skill_domain.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                {t('skill_domain.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('skill_domain.delete.cancel')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('skill_domain.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('skill_domain.delete.confirm')}</Button>
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
    const { t } = useTranslation();
    return <>
        <Table>
            <thead>
                <tr>
                    <th>{t('skill_domain.list.name.title')}</th>
                    <AdminOnly>
                        <th>{t('skill_domain.list.actions.title')}</th>
                    </AdminOnly>
                </tr>
            </thead>
            <tbody>
                {skill_domains.map((skill_domain, index) =>
                    <tr key={skill_domain.id}>
                        <td>{skill_domain.name}</td>
                        <AdminOnly>
                            <td>
                                <EditSkillDomainButton skill_domain={skill_domain} changedCallback={new_skill_domain => {
                                    const new_skill_domains = [...skill_domains];
                                    new_skill_domains[index] = new_skill_domain;
                                    setSkillDomains(new_skill_domains);
                                }} />
                                {' '}
                                <DeleteSkillDomainButton skill_domain={skill_domain} deletedCallback={() => {
                                    const new_skill_domains = [...skill_domains];
                                    new_skill_domains.splice(index, 1);
                                    setSkillDomains(new_skill_domains);
                                }} />
                            </td>
                        </AdminOnly>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}
