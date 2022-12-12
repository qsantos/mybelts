import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Exam, SchoolClass, ClassLevelsService, SchoolClassList } from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import ClassLevelDeleteButton from './ClassLevelDeleteButton';
import ClassLevelEditButton from './ClassLevelEditButton';
import SchoolClassListing from './SchoolClassListing';
import SchoolClassCreateButton from './SchoolClassCreateButton';
import { assert, BreadcrumbItem, Loader } from './index';
import ExamsManager from './ExamsManager';

export default function ClassLevelView(): ReactElement {
    const { class_level_id } = useParams();
    assert(class_level_id !== undefined);

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [schoolClassList, setSchoolClassList] =
        useState<null | SchoolClassList>(null);
    const navigate = useNavigate();

    const setSchoolClasses = useCallback(
        (
            setStateAction: (prevSchoolClasses: SchoolClass[]) => SchoolClass[]
        ) => {
            setSchoolClassList((prevSchoolClassList) => {
                if (prevSchoolClassList === null) {
                    return null;
                }
                const prevSchoolClasses = prevSchoolClassList.school_classes;
                const nextSchoolClasses = setStateAction(prevSchoolClasses);
                return {
                    ...prevSchoolClassList,
                    school_classes: nextSchoolClasses,
                };
            });
        },
        [setSchoolClassList]
    );

    const setExams = useCallback(
        (setStateAction: (prevExams: Exam[]) => Exam[]) => {
            setSchoolClassList((prevSchoolClassList) => {
                if (prevSchoolClassList === null) {
                    return null;
                }
                const prevExams = prevSchoolClassList.exams;
                const nextExams = setStateAction(prevExams);
                return {
                    ...prevSchoolClassList,
                    exams: nextExams,
                };
            });
        },
        [setSchoolClassList]
    );

    useEffect(() => {
        ClassLevelsService.getClassLevelResource(parseInt(class_level_id))
            .then(setSchoolClassList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, [class_level_id]);

    if (schoolClassList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem href="/class-levels">
                        {t('class_level.list.title.primary')}
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        active
                        href={'/class-levels/' + class_level_id}
                    >
                        {t('class_level.view.title')} ?
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('class_level.view.title')}: ?</h3>
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

    const { belts, skill_domains, class_level, school_classes, exams } =
        schoolClassList;

    const sorted_school_classes = school_classes.sort((a, b) =>
        a.suffix.localeCompare(b.suffix)
    );

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">
                    {t('class_level.list.title.primary')}
                </BreadcrumbItem>
                <BreadcrumbItem active href={'/class-levels/' + class_level.id}>
                    {t('class_level.view.title')} {class_level.prefix}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>
                {t('class_level.view.title')}: {class_level.prefix}
            </h3>
            <AdminOnly>
                <ClassLevelEditButton
                    class_level={class_level}
                    changedCallback={(new_class_level) => {
                        setSchoolClassList({
                            ...schoolClassList,
                            class_level: new_class_level,
                        });
                    }}
                />{' '}
                <ClassLevelDeleteButton
                    class_level={class_level}
                    deletedCallback={() => navigate('/class-levels')}
                />
            </AdminOnly>
            <h4>{t('school_class.list.title.secondary')}</h4>
            <AdminOnly>
                <SchoolClassCreateButton
                    class_level={class_level}
                    createdCallback={(new_school_class) => {
                        setSchoolClassList({
                            ...schoolClassList,
                            school_classes: [
                                ...school_classes,
                                new_school_class,
                            ],
                        });
                    }}
                />
            </AdminOnly>
            <SchoolClassListing
                class_level={class_level}
                school_classes={sorted_school_classes}
                setSchoolClasses={setSchoolClasses}
            />
            <ExamsManager
                exams={exams}
                setExams={setExams}
                belts={belts}
                skill_domains={skill_domains}
                class_level={class_level}
            />
        </>
    );
}
