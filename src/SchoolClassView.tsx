import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import {
    Student,
    SchoolClassesService,
    StudentList,
    WaitlistEntryList,
} from './api';
import { getAPIError } from './lib';
import { AdminOnly, LoginContext } from './auth';
import SchoolClassManageWaitlist from './SchoolClassManageWaitlist';
import SchoolClassWaitlist from './SchoolClassWaitlist';
import SchoolClassDeleteButton from './SchoolClassDeleteButton';
import SchoolClassEditButton from './SchoolClassEditButton';
import StudentUpdateRanks from './StudentUpdateRanks';
import StudentCreateButton from './StudentCreateButton';
import EvaluationGrid from './EvaluationGrid';
import { assert, BreadcrumbItem, Loader } from './index';

export default function SchoolClassView(): ReactElement {
    const { school_class_id } = useParams();
    assert(school_class_id !== undefined);

    const loginInfo = React.useContext(LoginContext);
    assert(loginInfo !== null);

    const canUseWaitlist = loginInfo.user.is_admin;

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [studentList, setStudentList] = useState<null | StudentList>(null);
    const [waitlistEntryList, setWaitlistEntryList] =
        useState<null | WaitlistEntryList>(null);
    const navigate = useNavigate();

    const setStudents = useCallback(
        (setStateAction: (prevStudents: Student[]) => Student[]) =>
            setStudentList((prevStudentList) => {
                if (prevStudentList === null) {
                    return null;
                }
                const prevStudents = prevStudentList.students;
                const nextStudents = setStateAction(prevStudents);
                return { ...prevStudentList, students: nextStudents };
            }),
        [setStudentList]
    );

    useEffect(() => {
        SchoolClassesService.getSchoolClassResource(parseInt(school_class_id))
            .then(setStudentList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
        if (canUseWaitlist) {
            SchoolClassesService.getSchoolClassWaitlistResource(
                parseInt(school_class_id)
            )
                .then(setWaitlistEntryList)
                .catch((error) => {
                    setErrorMessage(getAPIError(error));
                });
        }
    }, [school_class_id, canUseWaitlist]);

    if (
        studentList === null ||
        (canUseWaitlist && waitlistEntryList === null)
    ) {
        return (
            <>
                <AdminOnly>
                    <Breadcrumb>
                        <BreadcrumbItem href="/">
                            {t('home_page')}
                        </BreadcrumbItem>
                        <BreadcrumbItem href="/class-levels">
                            {t('class_level.list.title.primary')}
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {t('class_level.view.title')} ?
                        </BreadcrumbItem>
                        <BreadcrumbItem active href="/">
                            {t('school_class.view.title')} ?
                        </BreadcrumbItem>
                    </Breadcrumb>
                </AdminOnly>
                <h3>{t('school_class.view.title')}: ?</h3>
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
        class_level,
        school_class,
        students,
        student_belts,
    } = studentList;

    return (
        <>
            <AdminOnly>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem href="/class-levels">
                        {t('class_level.list.title.primary')}
                    </BreadcrumbItem>
                    <BreadcrumbItem href={'/class-levels/' + class_level.id}>
                        {t('class_level.view.title')} {class_level.prefix}
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        active
                        href={'/school-classes/' + school_class.id}
                    >
                        {t('school_class.view.title')} {school_class.suffix}
                    </BreadcrumbItem>
                </Breadcrumb>
            </AdminOnly>
            <h3>
                {t('school_class.view.title')}: {class_level.prefix}
                {school_class.suffix}
            </h3>
            <AdminOnly>
                {waitlistEntryList && (
                    <SchoolClassWaitlist
                        school_class={school_class}
                        students={students}
                        skill_domains={skill_domains}
                        belts={belts}
                        waitlist_entries={waitlistEntryList.waitlist_entries}
                    />
                )}
                <SchoolClassEditButton
                    class_level={class_level}
                    school_class={school_class}
                    changedCallback={(new_school_class) => {
                        setStudentList({
                            ...studentList,
                            school_class: new_school_class,
                        });
                    }}
                />{' '}
                <SchoolClassDeleteButton
                    class_level={class_level}
                    school_class={school_class}
                    deletedCallback={() =>
                        navigate('/class-levels/' + class_level.id)
                    }
                />
                <h4>{t('student.list.title.secondary')}</h4>
                <StudentCreateButton
                    school_class={school_class}
                    class_level={class_level}
                    createdCallback={(new_student) => {
                        setStudentList({
                            ...studentList,
                            students: [...students, new_student],
                        });
                    }}
                />{' '}
                <StudentUpdateRanks
                    students={students}
                    changedCallback={(new_students) => {
                        setStudentList({
                            ...studentList,
                            students: new_students,
                        });
                    }}
                />{' '}
                {waitlistEntryList && (
                    <SchoolClassManageWaitlist
                        class_level={class_level}
                        school_class={school_class}
                        students={students}
                        skill_domains={skill_domains}
                        belts={belts}
                        student_belts={student_belts}
                        waitlistEntryList={waitlistEntryList}
                        setWaitlistEntryList={setWaitlistEntryList}
                    />
                )}
            </AdminOnly>
            <EvaluationGrid
                students={students}
                setStudents={setStudents}
                skill_domains={skill_domains}
                belts={belts}
                student_belts={student_belts}
            />
        </>
    );
}
