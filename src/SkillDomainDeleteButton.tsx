import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { SkillDomain, SkillDomainsService } from './api';
import ModalButton from './ModalButton';

interface Props {
    skill_domain: SkillDomain;
    deletedCallback?: () => void;
}

export default function SkillDomainDeleteButton(props: Props): ReactElement {
    const { skill_domain, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="skill_domain.delete"
            i18nArgs={{ skill_domain }}
            onSubmit={() =>
                SkillDomainsService.deleteSkillDomainResource(skill_domain.id)
            }
            onResponse={() => deletedCallback?.()}
        >
            {t('skill_domain.delete.message', { skill_domain })}
        </ModalButton>
    );
}
