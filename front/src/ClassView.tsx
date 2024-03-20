import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import {
    Student,
    ClassesService,
    StudentList,
    WaitlistMappingList,
    WaitlistMapping,
} from './api';
import { getAPIError } from './lib';
import { AdminOnly, LoginContext } from './auth';
import ClassManageWaitlist from './ClassManageWaitlist';
import ClassWaitlist from './ClassWaitlist';
import ClassDeleteButton from './ClassDeleteButton';
import ClassEditButton from './ClassEditButton';
import StudentUpdateRanks from './StudentUpdateRanks';
import StudentCreateButton from './StudentCreateButton';
import EvaluationGrid from './EvaluationGrid';
import { assert, BreadcrumbItem, Loader } from './index';

export default function ClassView(): ReactElement {
    const { class_id } = useParams();
    assert(class_id !== undefined);

    const loginInfo = React.useContext(LoginContext);
    assert(loginInfo !== null);

    const canUseWaitlist = loginInfo.user.is_admin;

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [studentList, setStudentList] = useState<null | StudentList>(null);
    const [waitlistMappingList, setWaitlistMappingList] =
        useState<null | WaitlistMappingList>(null);
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

    const setWaitlistMappings = useCallback(
        (
            setStateAction: (
                prevWaitlistMappings: WaitlistMapping[]
            ) => WaitlistMapping[]
        ) => {
            setWaitlistMappingList((prevWaitlistMappingList) => {
                if (prevWaitlistMappingList === null) {
                    return null;
                }
                const prevWaitlistMappings =
                    prevWaitlistMappingList.waitlist_mappings;
                const nextWaitlistMappings =
                    setStateAction(prevWaitlistMappings);
                return {
                    ...prevWaitlistMappingList,
                    waitlist_mappings: nextWaitlistMappings,
                };
            });
        },
        [setWaitlistMappingList]
    );

    useEffect(() => {
        ClassesService.getClassResource(parseInt(class_id))
            .then(setStudentList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
        if (canUseWaitlist) {
            ClassesService.getClassWaitlistResource(
                parseInt(class_id)
            )
                .then(setWaitlistMappingList)
                .catch((error) => {
                    setErrorMessage(getAPIError(error));
                });
        }
    }, [class_id, canUseWaitlist]);

    if (
        studentList === null ||
        (canUseWaitlist && waitlistMappingList === null)
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
                            {t('class.view.title')} ?
                        </BreadcrumbItem>
                    </Breadcrumb>
                </AdminOnly>
                <h3>{t('class.view.title')}: ?</h3>
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
        class: class_,
        students,
        student_belts,
    } = studentList;

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
                        href={'/classes/' + class_.id}
                    >
                        {t('class.view.title')} {class_.suffix}
                    </BreadcrumbItem>
                </Breadcrumb>
            </AdminOnly>
            <h3>
                {t('class.view.title')}: {level.prefix}
                {class_.suffix}
            </h3>
            <AdminOnly>
                {waitlistMappingList && (
                    <ClassWaitlist
                        class={class_}
                        students={students}
                        skill_domains={skill_domains}
                        belts={belts}
                        waitlist_mappings={
                            waitlistMappingList.waitlist_mappings
                        }
                    />
                )}
                <ClassEditButton
                    level={level}
                    class={class_}
                    changedCallback={(new_class) => {
                        setStudentList({
                            ...studentList,
                            class: new_class,
                        });
                    }}
                />{' '}
                <ClassDeleteButton
                    level={level}
                    class={class_}
                    deletedCallback={() =>
                        navigate('/levels/' + level.id)
                    }
                />
                <h4>{t('student.list.title.secondary')}</h4>
                <StudentCreateButton
                    class={class_}
                    level={level}
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
                {waitlistMappingList && (
                    <ClassManageWaitlist
                        level={level}
                        class={class_}
                        students={students}
                        skill_domains={skill_domains}
                        belts={belts}
                        student_belts={student_belts}
                        waitlist_mappings={
                            waitlistMappingList.waitlist_mappings
                        }
                        setWaitlistMappings={setWaitlistMappings}
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
