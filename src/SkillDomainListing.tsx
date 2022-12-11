import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import { SkillDomain } from './api';
import { AdminOnly } from './auth';
import SkillDomainEditButton from './SkillDomainEditButton';
import SkillDomainDeleteButton from './SkillDomainDeleteButton';

interface Props {
    skill_domains: SkillDomain[];
    setSkillDomains: Dispatch<SkillDomain[]>;
}

export default function SkillDomainListing(props: Props): ReactElement {
    const { skill_domains, setSkillDomains } = props;
    const { t } = useTranslation();
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>{t('skill_domain.list.name.title')}</th>
                        <th>{t('skill_domain.list.code.title')}</th>
                        <AdminOnly>
                            <th>{t('skill_domain.list.actions.title')}</th>
                        </AdminOnly>
                    </tr>
                </thead>
                <tbody>
                    {skill_domains.map((skill_domain, index) => (
                        <tr key={skill_domain.id}>
                            <td>{skill_domain.name}</td>
                            <td>{skill_domain.code}</td>
                            <AdminOnly>
                                <td>
                                    <SkillDomainEditButton
                                        skill_domain={skill_domain}
                                        changedCallback={(new_skill_domain) => {
                                            const new_skill_domains = [
                                                ...skill_domains,
                                            ];
                                            new_skill_domains[index] =
                                                new_skill_domain;
                                            setSkillDomains(new_skill_domains);
                                        }}
                                    />{' '}
                                    <SkillDomainDeleteButton
                                        skill_domain={skill_domain}
                                        deletedCallback={() => {
                                            const new_skill_domains = [
                                                ...skill_domains,
                                            ];
                                            new_skill_domains.splice(index, 1);
                                            setSkillDomains(new_skill_domains);
                                        }}
                                    />
                                </td>
                            </AdminOnly>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}
