import React from 'react';
import { Dispatch, ReactElement, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Exam, Belt, SkillDomain, Level } from './api';
import ExamBulkUpload from './ExamBulkUpload';
import ExamGrid from './ExamGrid';

export interface Props {
    exams: Exam[];
    setExams: Dispatch<(prevExams: Exam[]) => Exam[]>;
    belts: Belt[];
    skill_domains: SkillDomain[];
    level: Level;
}

function ExamsManager_(props: Props): ReactElement {
    const { exams, setExams, belts, skill_domains, level } = props;
    const { t } = useTranslation();

    const createdCallback = useCallback(
        (nextExam: Exam) => setExams((prevExams) => [...prevExams, nextExam]),
        [setExams]
    );

    const changedCallback = useCallback(
        (nextExam: Exam) =>
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
            }),
        [setExams]
    );

    const deletedCallback = useCallback(
        (exam_id: number) =>
            setExams((prevExams: Exam[]) => {
                const index = prevExams.findIndex(
                    (exam) => exam.id === exam_id
                );
                if (index === null) {
                    return prevExams;
                }
                const nextExams = [...prevExams];
                nextExams.splice(index, 1);
                return nextExams;
            }),
        [setExams]
    );

    return (
        <>
            <h4>{t('exam.title')}</h4>
            <ExamGrid
                belts={belts}
                skill_domains={skill_domains}
                level={level}
                exams={exams}
                createdCallback={createdCallback}
                changedCallback={changedCallback}
                deletedCallback={deletedCallback}
            />
            <ExamBulkUpload
                belts={belts}
                skill_domains={skill_domains}
                level={level}
                createdCallback={createdCallback}
            />
        </>
    );
}

const ExamsManager = React.memo(ExamsManager_);

export default ExamsManager;
