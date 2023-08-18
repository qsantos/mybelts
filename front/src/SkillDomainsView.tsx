import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { SkillDomain, SkillDomainList, SkillDomainsService } from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import SkillDomainListing from './SkillDomainListing';
import SkillDomainCreateButton from './SkillDomainCreateButton';
import { BreadcrumbItem, Loader } from './index';

export default function SkillDomainsView(): ReactElement {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [skillDomainList, setSkillDomainList] =
        useState<null | SkillDomainList>(null);

    const setSkillDomains = useCallback(
        (setStateAction: (prevSkillDomains: SkillDomain[]) => SkillDomain[]) =>
            setSkillDomainList((prevSkillDomainList) => {
                if (prevSkillDomainList === null) {
                    return null;
                }
                const prevSkillDomains = prevSkillDomainList.skill_domains;
                const nextSkillDomains = setStateAction(prevSkillDomains);
                return {
                    ...prevSkillDomainList,
                    skill_domains: nextSkillDomains,
                };
            }),
        [setSkillDomainList]
    );

    useEffect(() => {
        SkillDomainsService.getSkillDomainsResource()
            .then(setSkillDomainList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, []);

    if (skillDomainList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem active href="/skill-domains">
                        {t('skill_domain.list.title.primary')}
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('skill_domain.list.title.primary')}</h3>
                {errorMessage ? (
                    <Alert variant="danger">
                        {t('error')}: {errorMessage}
                    </Alert>
                ) : (
                    <Loader />
                )}
            </>
        );
    }

    const { skill_domains } = skillDomainList;
    const sorted_skill_domains = skill_domains.sort((a, b) =>
        a.code.localeCompare(b.code)
    );

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/skill-domains">
                    {t('skill_domain.list.title.primary')}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('skill_domain.list.title.primary')}</h3>
            <AdminOnly>
                <SkillDomainCreateButton
                    createdCallback={(new_skill_domain) => {
                        setSkillDomainList({
                            ...skillDomainList,
                            skill_domains: [...skill_domains, new_skill_domain],
                        });
                    }}
                />
            </AdminOnly>
            <h4>{t('skill_domain.list.title.secondary')}</h4>
            <SkillDomainListing
                skill_domains={sorted_skill_domains}
                setSkillDomains={setSkillDomains}
            />
        </>
    );
}
