import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import { Belt, ClassLevel, Exam, SkillDomain } from './api';
import BeltIcon from './BeltIcon';
import ClassLevelExamEditButton from './ClassLevelExamEditButton';
import ClassLevelExamUploadButton from './ClassLevelExamUploadButton';

interface Props {
    belts: Belt[];
    skill_domains: SkillDomain[];
    class_level: ClassLevel;
    exams: Exam[];
    createdCallback: (new_exam: Exam) => void;
    changedCallback?: (changed_exam: Exam) => void;
    deletedCallback?: (exam_id: number) => void;
}

export default function ClassLevelExams(props: Props): ReactElement {
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

    const skill_domain_options = skill_domains.map((skill_domain) => ({
        value: skill_domain.id,
        label: skill_domain.name,
    }));
    const belt_options = belts.map((belt) => ({
        value: belt.id,
        label: belt.name,
    }));

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
                    <tr key={skill_domain.id}>
                        <th>{skill_domain.name}</th>
                        {sorted_belts.map((belt) => {
                            const lexams =
                                exams_by_belt_by_domain[skill_domain.id]?.[
                                    belt.id
                                ];
                            const sorted_lexams = lexams?.sort((a, b) =>
                                a.code.localeCompare(b.code)
                            );
                            return (
                                <td key={belt.id}>
                                    {sorted_lexams &&
                                        sorted_lexams.map((exam) => (
                                            <ClassLevelExamEditButton
                                                key={exam.id}
                                                exam={exam}
                                                skill_domain={skill_domain}
                                                belt={belt}
                                                skill_domain_options={
                                                    skill_domain_options
                                                }
                                                belt_options={belt_options}
                                                changedCallback={
                                                    changedCallback
                                                }
                                                deletedCallback={
                                                    deletedCallback
                                                }
                                            />
                                        ))}
                                    <ClassLevelExamUploadButton
                                        belt={belt}
                                        skill_domain={skill_domain}
                                        class_level={class_level}
                                        createdCallback={createdCallback}
                                    />
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
