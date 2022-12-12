import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import { SkillDomain } from './api';
import { AdminOnly } from './auth';
import SkillDomainEditButton from './SkillDomainEditButton';
import SkillDomainDeleteButton from './SkillDomainDeleteButton';

interface RowProps {
    index: number;
    skill_domain: SkillDomain;
    setSkillDomains: Dispatch<
        (prevSkillDomains: SkillDomain[]) => SkillDomain[]
    >;
}

function SkillDomainRow_(props: RowProps) {
    const { index, skill_domain, setSkillDomains } = props;

    const changedCallback = (nextSkillDomain: SkillDomain) =>
        setSkillDomains((prevSkillDomains) => {
            const nextSkillDomains = [...prevSkillDomains];
            nextSkillDomains[index] = nextSkillDomain;
            return nextSkillDomains;
        });

    const deletedCallBack = () =>
        setSkillDomains((prevSkillDomains) => {
            const nextSkillDomains = [...prevSkillDomains];
            nextSkillDomains.splice(index, 1);
            return nextSkillDomains;
        });

    return (
        <tr key={skill_domain.id}>
            <td>{skill_domain.name}</td>
            <td>{skill_domain.code}</td>
            <AdminOnly>
                <td>
                    <SkillDomainEditButton
                        skill_domain={skill_domain}
                        changedCallback={changedCallback}
                    />{' '}
                    <SkillDomainDeleteButton
                        skill_domain={skill_domain}
                        deletedCallback={deletedCallBack}
                    />
                </td>
            </AdminOnly>
        </tr>
    );
}

const SkillDomainRow = React.memo(SkillDomainRow_);

interface Props {
    skill_domains: SkillDomain[];
    setSkillDomains: Dispatch<
        (prevSkillDomains: SkillDomain[]) => SkillDomain[]
    >;
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
                        <SkillDomainRow
                            key={skill_domain.id}
                            index={index}
                            skill_domain={skill_domain}
                            setSkillDomains={setSkillDomains}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    );
}
