import React from 'react';
import { Dispatch, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';

import { Belt, Evaluation, SkillDomain, Student } from './api';
import { AdminOnly, LoginContext } from './auth';
import { formatDate } from './lib';
import BeltIcon from './BeltIcon';
import SortTable from './SortTable';
import EvaluationEditButton from './EvaluationEditButton';
import EvaluationDeleteButton from './EvaluationDeleteButton';

interface Option {
    value: number;
    label: string;
}

interface RowProps {
    evaluation: Evaluation;
    belt: Belt;
    skill_domain: SkillDomain;
    student: Student;
    setEvaluations: Dispatch<(prevState: Evaluation[]) => Evaluation[]>;
    belt_options: Option[];
    skill_domain_options: Option[];
}

function EvaluationListingRow_(props: RowProps) {
    const {
        evaluation,
        belt,
        skill_domain,
        student,
        setEvaluations,
        belt_options,
        skill_domain_options,
    } = props;

    const changedCallback = (nextEvaluation: Evaluation) =>
        setEvaluations((prevEvaluations) => {
            const index = prevEvaluations.findIndex(
                (otherEvaluation) => otherEvaluation.id === nextEvaluation.id
            );
            if (index === null) {
                return prevEvaluations;
            }
            const nextEvaluations = [...prevEvaluations];
            nextEvaluations[index] = nextEvaluation;
            return nextEvaluations;
        });

    const deletedCallback = (evaluation_id: number) =>
        setEvaluations((prevEvaluations) => {
            const index = prevEvaluations.findIndex(
                (otherEvaluation) => otherEvaluation.id === evaluation_id
            );
            if (index === null) {
                return prevEvaluations;
            }
            const nextEvaluations = [...prevEvaluations];
            nextEvaluations.splice(index, 1);
            return nextEvaluations;
        });

    return (
        <tr>
            <td>{skill_domain.name}</td>
            <td>
                <BeltIcon belt={belt} />
            </td>
            <td>{formatDate(evaluation.date)}</td>
            <td>{evaluation.success ? '✅' : '❌'}</td>
            <AdminOnly>
                <td>
                    <EvaluationEditButton
                        evaluation={evaluation}
                        student={student}
                        skill_domain={skill_domain}
                        belt={belt}
                        skill_domain_options={skill_domain_options}
                        belt_options={belt_options}
                        changedCallback={changedCallback}
                    />{' '}
                    <EvaluationDeleteButton
                        evaluation={evaluation}
                        student={student}
                        skill_domain={skill_domain}
                        belt={belt}
                        deletedCallback={deletedCallback}
                    />
                </td>
            </AdminOnly>
        </tr>
    );
}

const EvaluationListingRow = React.memo(EvaluationListingRow_);

interface Props {
    skill_domains: SkillDomain[];
    belts: Belt[];
    student: Student;
    evaluations: Evaluation[];
    setEvaluations: Dispatch<(prevState: Evaluation[]) => Evaluation[]>;
}

export default function EvaluationListing(props: Props): ReactElement | null {
    const { skill_domains, belts, student, evaluations, setEvaluations } =
        props;
    const { t } = useTranslation();
    const loginInfo = React.useContext(LoginContext);

    const skill_domain_by_id = useMemo(
        () =>
            Object.fromEntries(
                skill_domains.map((skill_domain) => [
                    skill_domain.id,
                    skill_domain,
                ])
            ),
        [skill_domains]
    );
    const belt_by_id = useMemo(
        () => Object.fromEntries(belts.map((belt) => [belt.id, belt])),
        [belts]
    );

    const columns = React.useMemo(() => {
        const ret: ColumnDef<Evaluation>[] = [
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
            },
            {
                id: 'date',
                header: t('evaluation.list.date.title'),
                accessorKey: 'date',
            },
            {
                id: 'passed',
                header: t('evaluation.list.passed.title'),
                accessorKey: 'success',
            },
        ];

        if (loginInfo?.user?.is_admin) {
            ret.push({
                id: 'actions',
                header: t('evaluation.list.actions.title'),
            });
        }
        return ret;
    }, [belt_by_id, loginInfo, skill_domain_by_id, t]);

    const sorting = [
        {
            id: 'date',
            desc: true,
        },
    ];

    const rowComponent = useMemo(() => {
        const skill_domain_options = skill_domains.map((skill_domain) => ({
            value: skill_domain.id,
            label: skill_domain.name,
        }));
        const belt_options = belts.map((belt) => ({
            value: belt.id,
            label: belt.name,
        }));

        function RowComponent(evaluation: Evaluation) {
            const skill_domain_id = evaluation.skill_domain_id;
            const belt_id = evaluation.belt_id;
            const skill_domain = skill_domain_by_id[evaluation.skill_domain_id];
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
                <EvaluationListingRow
                    key={evaluation.id}
                    evaluation={evaluation}
                    belt={belt}
                    skill_domain={skill_domain}
                    student={student}
                    setEvaluations={setEvaluations}
                    belt_options={belt_options}
                    skill_domain_options={skill_domain_options}
                />
            );
        }
        return RowComponent;
    }, [
        belts,
        skill_domains,
        belt_by_id,
        setEvaluations,
        skill_domain_by_id,
        student,
    ]);

    return (
        <SortTable
            data={evaluations}
            columns={columns}
            initialSorting={sorting}
            rowComponent={rowComponent}
        />
    );
}
