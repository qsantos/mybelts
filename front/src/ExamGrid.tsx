import React from 'react';
import { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import { Belt, ClassLevel, Exam, SkillDomain } from './api';
import BeltIcon from './BeltIcon';
import ExamEditButton from './ExamEditButton';
import ExamUploadButton from './ExamUploadButton';

interface Option {
    value: number;
    label: string;
}

interface RowProps {
    sorted_belts: Belt[];
    skill_domain: SkillDomain;
    class_level: ClassLevel;
    exams_by_belt: { [index: number]: Exam[] };
    createdCallback: (new_exam: Exam) => void;
    changedCallback?: (changed_exam: Exam) => void;
    deletedCallback?: (exam_id: number) => void;
    belt_options: Option[];
    skill_domain_options: Option[];
}

function ExamRow(props: RowProps) {
    const {
        sorted_belts,
        skill_domain,
        class_level,
        exams_by_belt,
        createdCallback,
        changedCallback,
        deletedCallback,
        belt_options,
        skill_domain_options,
    } = props;
    return (
        <tr key={skill_domain.id}>
            <th>{skill_domain.name}</th>
            {sorted_belts.map((belt) => {
                const lexams = exams_by_belt[belt.id];
                const sorted_lexams = lexams?.sort((a, b) =>
                    a.code.localeCompare(b.code)
                );
                return (
                    <td key={belt.id}>
                        {sorted_lexams &&
                            sorted_lexams.map((exam) => (
                                <ExamEditButton
                                    key={exam.id}
                                    exam={exam}
                                    skill_domain={skill_domain}
                                    belt={belt}
                                    skill_domain_options={skill_domain_options}
                                    belt_options={belt_options}
                                    changedCallback={changedCallback}
                                    deletedCallback={deletedCallback}
                                />
                            ))}
                        <ExamUploadButton
                            belt={belt}
                            skill_domain={skill_domain}
                            class_level={class_level}
                            createdCallback={createdCallback}
                        />
                    </td>
                );
            })}
        </tr>
    );
}

interface Props {
    belts: Belt[];
    skill_domains: SkillDomain[];
    class_level: ClassLevel;
    exams: Exam[];
    createdCallback: (new_exam: Exam) => void;
    changedCallback?: (changed_exam: Exam) => void;
    deletedCallback?: (exam_id: number) => void;
}

export default function ExamGrid(props: Props): ReactElement {
    const {
        belts,
        skill_domains,
        class_level,
        exams,
        createdCallback,
        changedCallback,
        deletedCallback,
    } = props;
    const { t } = useTranslation();

    const skill_domain_options = useMemo(
        () =>
            skill_domains.map((skill_domain) => ({
                value: skill_domain.id,
                label: skill_domain.name,
            })),
        [skill_domains]
    );
    const belt_options = useMemo(
        () =>
            belts.map((belt) => ({
                value: belt.id,
                label: belt.name,
            })),
        [belts]
    );

    const sorted_belts = belts.sort((a, b) => a.rank - b.rank);
    const sorted_skill_domains = skill_domains.sort((a, b) =>
        a.code.localeCompare(b.code)
    );

    const exams_by_belt_by_domain: {
        [index: number]: { [index: number]: Exam[] };
    } = {};
    for (const exam of exams) {
        const domain_id = exam.skill_domain_id;
        const belt_id = exam.belt_id;
        const exams_by_belt = exams_by_belt_by_domain[domain_id];
        if (exams_by_belt === undefined) {
            exams_by_belt_by_domain[domain_id] = { [belt_id]: [exam] };
        } else {
            const lexams = exams_by_belt[belt_id];
            if (lexams === undefined) {
                exams_by_belt[belt_id] = [exam];
            } else {
                lexams.push(exam);
            }
        }
    }
    return (
        <Table>
            <thead>
                <tr>
                    <th>{t('exam.skill_domain.title')}</th>
                    {sorted_belts.map((belt) => (
                        <th key={belt.id}>
                            <BeltIcon belt={belt} height={25} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {sorted_skill_domains.map((skill_domain) => (
                    <ExamRow
                        key={skill_domain.id}
                        sorted_belts={sorted_belts}
                        skill_domain={skill_domain}
                        class_level={class_level}
                        exams_by_belt={
                            exams_by_belt_by_domain[skill_domain.id] || []
                        }
                        createdCallback={createdCallback}
                        changedCallback={changedCallback}
                        deletedCallback={deletedCallback}
                        belt_options={belt_options}
                        skill_domain_options={skill_domain_options}
                    />
                ))}
            </tbody>
        </Table>
    );
}
