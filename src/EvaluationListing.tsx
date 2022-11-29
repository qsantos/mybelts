import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';

import { Belt, Evaluation, SkillDomain, Student } from './api';
import { LoginContext } from './auth';
import { BeltIcon } from './BeltIcon';
import { formatDate } from './lib';
import { SortTable } from './SortTable';
import { EvaluationEditButton } from './EvaluationEditButton';
import { EvaluationDeleteButton } from './EvaluationDeleteButton';

interface Props {
    skill_domains: SkillDomain[];
    belts: Belt[];
    student: Student;
    evaluations: Evaluation[];
    setEvaluations: (evaluations: Evaluation[]) => void;
}

export function EvaluationListing(props: Props): ReactElement | null {
    const { skill_domains, belts, student, evaluations, setEvaluations } =
        props;
    const { t } = useTranslation();
    const loginInfo = React.useContext(LoginContext);
    if (!loginInfo) {
        return null;
    }

    const skill_domain_by_id = Object.fromEntries(
        skill_domains.map((skill_domain) => [skill_domain.id, skill_domain])
    );
    const belt_by_id = Object.fromEntries(belts.map((belt) => [belt.id, belt]));

    const skill_domain_options = skill_domains.map((skill_domain) => ({
        value: skill_domain.id,
        label: skill_domain.name,
    }));

    const belt_options = belts.map((belt) => ({
        value: belt.id,
        label: belt.name,
    }));

    const columns: ColumnDef<Evaluation>[] = [
        {
            id: 'evaluation',
            header: t('evaluation.list.skill_domain.title'),
            accessorFn: (evaluation) => {
                const skill_domain_id = evaluation.skill_domain_id;
                const skill_domain = skill_domain_by_id[skill_domain_id];
                if (skill_domain === undefined) {
                    // should not happen
                    console.error(
                        'skill_domain ' +
                            skill_domain_id +
                            ' not found for evaluation ' +
                            evaluation.id
                    );
                    return null;
                }
                return skill_domain.name;
            },
        },
        {
            id: 'belt',
            header: t('evaluation.list.belt.title'),
            accessorFn: (evaluation) => {
                const belt_id = evaluation.belt_id;
                const belt = belt_by_id[belt_id];
                if (belt === undefined) {
                    // should not happen
                    console.error(
                        'belt ' +
                            belt_id +
                            ' not found for evaluation ' +
                            evaluation.id
                    );
                    return null;
                }
                return belt.name;
            },
            cell: (info) => {
                const evaluation = info.row.original;
                const belt_id = evaluation.belt_id;
                const belt = belt_by_id[belt_id];
                if (belt === undefined) {
                    // should not happen
                    console.error(
                        'belt ' +
                            belt_id +
                            ' not found for evaluation ' +
                            evaluation.id
                    );
                    return null;
                }
                return <BeltIcon belt={belt} />;
            },
        },
        {
            id: 'date',
            header: t('evaluation.list.date.title'),
            accessorKey: 'date',
            cell: (info) => formatDate(info.row.original.date),
        },
        {
            id: 'passed',
            header: t('evaluation.list.passed.title'),
            accessorKey: 'success',
            cell: (info) => (info.getValue() ? '✅' : '❌'),
        },
    ];

    if (loginInfo.user.is_admin) {
        columns.push({
            id: 'actions',
            header: t('evaluation.list.actions.title'),
            cell: (info) => {
                const evaluation = info.row.original;
                const skill_domain_id = evaluation.skill_domain_id;
                const belt_id = evaluation.belt_id;
                const skill_domain =
                    skill_domain_by_id[evaluation.skill_domain_id];
                const belt = belt_by_id[evaluation.belt_id];
                if (skill_domain === undefined) {
                    // should not happen
                    console.error(
                        'skill_domain ' +
                            skill_domain_id +
                            ' not found for evaluation ' +
                            evaluation.id
                    );
                    return null;
                }
                if (belt === undefined) {
                    // should not happen
                    console.error(
                        'belt ' +
                            belt_id +
                            ' not found for evaluation ' +
                            evaluation.id
                    );
                    return null;
                }
                return (
                    <>
                        <EvaluationEditButton
                            evaluation={evaluation}
                            student={student}
                            skill_domain={skill_domain}
                            belt={belt}
                            skill_domain_options={skill_domain_options}
                            belt_options={belt_options}
                            changedCallback={(new_evaluation) => {
                                const new_evaluations = [...evaluations];
                                new_evaluations[info.row.index] =
                                    new_evaluation;
                                setEvaluations(new_evaluations);
                            }}
                        />{' '}
                        <EvaluationDeleteButton
                            evaluation={evaluation}
                            student={student}
                            skill_domain={skill_domain}
                            belt={belt}
                            deletedCallback={() => {
                                const new_evaluations = [...evaluations];
                                new_evaluations.splice(info.row.index, 1);
                                setEvaluations(new_evaluations);
                            }}
                        />
                    </>
                );
            },
        });
    }

    const sorting = [
        {
            id: 'date',
            desc: true,
        },
    ];

    return (
        <SortTable
            data={evaluations}
            columns={columns}
            initialSorting={sorting}
        />
    );
}
