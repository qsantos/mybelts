import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Exam, SchoolClass, LevelsService, SchoolClassList } from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import LevelDeleteButton from './LevelDeleteButton';
import LevelEditButton from './LevelEditButton';
import SchoolClassListing from './SchoolClassListing';
import SchoolClassCreateButton from './SchoolClassCreateButton';
import { assert, BreadcrumbItem, Loader } from './index';
import ExamsManager from './ExamsManager';

export default function LevelView(): ReactElement {
    const { level_id } = useParams();
    assert(level_id !== undefined);

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
        LevelsService.getLevelResource(parseInt(level_id))
            .then(setSchoolClassList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, [level_id]);

    if (schoolClassList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem href="/levels">
                        {t('level.list.title.primary')}
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        active
                        href={'/levels/' + level_id}
                    >
                        {t('level.view.title')} ?
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('level.view.title')}: ?</h3>
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

    const { belts, skill_domains, level, school_classes, exams } =
        schoolClassList;

    const sorted_school_classes = school_classes.sort((a, b) =>
        a.suffix.localeCompare(b.suffix)
    );

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem href="/levels">
                    {t('level.list.title.primary')}
                </BreadcrumbItem>
                <BreadcrumbItem active href={'/levels/' + level.id}>
                    {t('level.view.title')} {level.prefix}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>
                {t('level.view.title')}: {level.prefix}
            </h3>
            <AdminOnly>
                <LevelEditButton
                    level={level}
                    changedCallback={(new_level) => {
                        setSchoolClassList({
                            ...schoolClassList,
                            level: new_level,
                        });
                    }}
                />{' '}
                <LevelDeleteButton
                    level={level}
                    deletedCallback={() => navigate('/levels')}
                />
            </AdminOnly>
            <h4>{t('school_class.list.title.secondary')}</h4>
            <AdminOnly>
                <SchoolClassCreateButton
                    level={level}
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
                level={level}
                school_classes={sorted_school_classes}
                setSchoolClasses={setSchoolClasses}
            />
            <ExamsManager
                exams={exams}
                setExams={setExams}
                belts={belts}
                skill_domains={skill_domains}
                level={level}
            />
        </>
    );
}
