import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import { SkillDomain, SkillDomainsService } from './api';
import { AdminOnly } from './auth';
import { ModalButton } from './modal-button';

interface CreateSkillDomainButtonProps {
    createdCallback?: (skill_domain: SkillDomain) => void;
}

export function CreateSkillDomainButton(props : CreateSkillDomainButtonProps): ReactElement {
    const { createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="skill_domain.add"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: {value: string};
                };
                return SkillDomainsService.postSkillDomainsResource({
                    name: typed_form.name.value,
                });
            }}
            onResponse={({ skill_domain }) => createdCallback?.(skill_domain)}
        >
            <Form.Group controlId="name">
                <Form.Label>{t('skill_domain.add_edit.name.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('skill_domain.add_edit.name.placeholder')}/>
                <Form.Text className="text-muted">
                    {t('skill_domain.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface EditSkillDomainButtonProps {
    skill_domain: SkillDomain;
    changedCallback?: (changed_skill_domain: SkillDomain) => void;
}

export function EditSkillDomainButton(props : EditSkillDomainButtonProps): ReactElement {
    const { skill_domain, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="skill_domain.edit"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    name: {value: string};
                };
                return SkillDomainsService.putSkillDomainResource(skill_domain.id, {
                    name: typed_form.name.value,
                });
            }}
            onResponse={({ skill_domain: changed_skill_domain }) => changedCallback?.(changed_skill_domain)}
        >
            <Form.Group controlId="name">
                <Form.Label>{t('skill_domain.add_edit.name.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('skill_domain.add_edit.name.placeholder')} defaultValue={skill_domain.name} />
                <Form.Text className="text-muted">
                    {t('skill_domain.add_edit.name.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface DeleteSkillDomainButtonProps {
    skill_domain: SkillDomain;
    deletedCallback?: () => void;
}

export function DeleteSkillDomainButton(props : DeleteSkillDomainButtonProps): ReactElement {
    const { skill_domain, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="skill_domain.delete"
            onSubmit={() => SkillDomainsService.deleteSkillDomainResource(skill_domain.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('skill_domain.delete.message')}
        </ModalButton>
    );
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
