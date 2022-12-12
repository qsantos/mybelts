import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Exam, Belt, SkillDomain, ClassLevel } from './api';
import ClassLevelExamBulkUpload from './ClassLevelExamBulkUpload';
import ClassLevelExams from './ClassLevelExams';

export interface Props {
    exams: Exam[];
    setExams: Dispatch<(prevExams: Exam[]) => Exam[]>;
    belts: Belt[];
    skill_domains: SkillDomain[];
    class_level: ClassLevel;
}

export default function ExamsManager(props: Props): ReactElement {
    const { exams, setExams, belts, skill_domains, class_level } = props;
    const { t } = useTranslation();

    const createdCallback = (nextExam: Exam) =>
        setExams((prevExams) => [...prevExams, nextExam]);

    const changedCallback = (nextExam: Exam) =>
        setExams((prevExams) => {
            const index = prevExams.findIndex(
                (exam) => exam.id === nextExam.id
            );
            if (index === null) {
                return prevExams;
            }
            const nextExams = [...prevExams];
            nextExams[index] = nextExam;
            return nextExams;
        });

    const deletedCallback = (exam_id: number) =>
        setExams((prevExams: Exam[]) => {
            const index = prevExams.findIndex((exam) => exam.id === exam_id);
            if (index === null) {
                return prevExams;
            }
            const nextExams = [...prevExams];
            nextExams.splice(index, 1);
            return nextExams;
        });

    return (
        <>
            <h4>{t('exam.title')}</h4>
            <ClassLevelExams
                belts={belts}
                skill_domains={skill_domains}
                class_level={class_level}
                exams={exams}
                createdCallback={createdCallback}
                changedCallback={changedCallback}
                deletedCallback={deletedCallback}
            />
            <ClassLevelExamBulkUpload
                belts={belts}
                skill_domains={skill_domains}
                class_level={class_level}
                createdCallback={createdCallback}
            />
        </>
    );
}
