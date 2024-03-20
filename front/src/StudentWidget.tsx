import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { ReactElement, useCallback } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import {
    Evaluation,
    StudentsService,
    EvaluationList,
    WaitlistEntryList,
} from './api';
import { getAPIError } from './lib';
import { AdminOnly, LoginContext } from './auth';
import StudentBelts from './StudentBelts';
import StudentDeleteButton from './StudentDeleteButton';
import StudentEditButton from './StudentEditButton';
import EvaluationListing from './EvaluationListing';
import EvaluationCreateButton from './EvaluationCreateButton';
import { assert, BreadcrumbItem, Loader } from './index';

interface Props {
    student_id: number;
}

export default function StudentWidget(props: Props): ReactElement {
    const { student_id } = props;

    const loginInfo = React.useContext(LoginContext);
    assert(loginInfo !== null);
    const canUseWaitlist =
        loginInfo.user.is_admin || loginInfo.student?.id === student_id;

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [evaluationList, setEvaluationList] = useState<null | EvaluationList>(
        null
    );
    const [waitlistEntryList, setWaitlistEntryList] =
        useState<null | WaitlistEntryList>(null);
    const navigate = useNavigate();

    const setEvaluations = useCallback(
        (setStateAction: (prevEvaluations: Evaluation[]) => Evaluation[]) =>
            setEvaluationList((prevEvaluationList) => {
                if (prevEvaluationList === null) {
                    return null;
                }
                const prevEvaluations = prevEvaluationList.evaluations;
                const nextEvaluations = setStateAction(prevEvaluations);
                return {
                    ...prevEvaluationList,
                    evaluations: nextEvaluations,
                };
            }),
        [setEvaluationList]
    );

    useEffect(() => {
        StudentsService.getStudentResource(student_id)
            .then(setEvaluationList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
        if (canUseWaitlist) {
            StudentsService.getStudentWaitlistResource(student_id)
                .then(setWaitlistEntryList)
                .catch((error) => {
                    setErrorMessage(getAPIError(error));
                });
        }
    }, [canUseWaitlist, student_id]);

    if (
        evaluationList === null ||
        (canUseWaitlist && waitlistEntryList === null)
    ) {
        return (
            <>
                <AdminOnly>
                    <Breadcrumb>
                        <BreadcrumbItem href="/">
                            {t('home_page')}
                        </BreadcrumbItem>
                        <BreadcrumbItem href="/levels">
                            {t('level.list.title.primary')}
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {t('level.view.title')} ?
                        </BreadcrumbItem>
                        <BreadcrumbItem active href="/">
                            {t('school_class.view.title')} ?
                        </BreadcrumbItem>
                        <BreadcrumbItem active href={'/students/' + student_id}>
                            {t('student.view.title')} ?
                        </BreadcrumbItem>
                    </Breadcrumb>
                </AdminOnly>
                <h3>{t('student.view.title')}: ?</h3>
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

    const {
        belts,
        skill_domains,
        level,
        school_class,
        student,
        evaluations,
    } = evaluationList;

    const sorted_skill_domains = skill_domains.sort((a, b) =>
        a.code.localeCompare(b.code)
    );

    return (
        <>
            <AdminOnly>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem href="/levels">
                        {t('level.list.title.primary')}
                    </BreadcrumbItem>
                    <BreadcrumbItem href={'/levels/' + level.id}>
                        {t('level.view.title')} {level.prefix}
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        active
                        href={'/school-classes/' + school_class.id}
                    >
                        {t('school_class.view.title')} {school_class.suffix}
                    </BreadcrumbItem>
                    <BreadcrumbItem active href={'/students/' + student.id}>
                        {t('student.view.title')} {student.display_name}
                    </BreadcrumbItem>
                </Breadcrumb>
            </AdminOnly>
            <h3>
                {t('student.view.title')}: {student.display_name}
            </h3>
            {t('student.view.school_class')}:{' '}
            <Link to={'/school-classes/' + school_class.id}>
                {level.prefix}
                {school_class.suffix}
            </Link>
            <AdminOnly>
                <br />
                <StudentEditButton
                    student={student}
                    changedCallback={(new_student) => {
                        setEvaluationList({
                            ...evaluationList,
                            student: new_student,
                        });
                    }}
                />{' '}
                <StudentDeleteButton
                    student={student}
                    deletedCallback={() =>
                        navigate('/school-classes/' + school_class.id)
                    }
                />
            </AdminOnly>
            <h4>{t('student.belts.title')}</h4>
            <StudentBelts
                skill_domains={sorted_skill_domains}
                belts={belts}
                student={student}
                evaluations={evaluations}
                canUseWaitlist={canUseWaitlist}
                waitlist_entries={waitlistEntryList?.waitlist_entries || []}
                setWaitlistEntries={(new_waitlist_entries) => {
                    if (waitlistEntryList) {
                        setWaitlistEntryList({
                            ...waitlistEntryList,
                            waitlist_entries: new_waitlist_entries,
                        });
                    }
                }}
            />
            <h4>{t('evaluation.list.title.secondary')}</h4>
            <AdminOnly>
                <EvaluationCreateButton
                    student={student}
                    skill_domains={skill_domains}
                    belts={belts}
                    createdCallback={(new_evaluation) => {
                        setEvaluationList({
                            ...evaluationList,
                            evaluations: [...evaluations, new_evaluation],
                        });
                    }}
                />
            </AdminOnly>
            <EvaluationListing
                skill_domains={skill_domains}
                belts={belts}
                student={student}
                evaluations={evaluations}
                setEvaluations={setEvaluations}
            />
        </>
    );
}
